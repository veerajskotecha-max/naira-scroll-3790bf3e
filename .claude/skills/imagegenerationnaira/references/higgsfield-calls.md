# Higgsfield call mechanics

Everything here is the shape that actually works. Getting a signature wrong costs a round trip
and, on `generate_image_batch`, real credits.

## The four-step loop

```
media_upload  →  curl PUT the bytes  →  media_confirm  →  generate_image_batch  →  jobs_wait
```

## 1. media_upload

```jsonc
{ "files": [ { "filename": "heartline-necklace-r1.png", "content_type": "image/png" }, … ] }
```

- 1–20 files per call.
- References must be **PNG or JPEG with a real extension**. Shopify CDN files downloaded raw often
  arrive as `.img`; re-save them through PIL before uploading.
- Cap references at ~1600px on the long edge. Larger buys nothing and inflates the response.
- The response carries one `upload_url` + `media_id` per file. It is long. With more than about four
  files it **exceeds the tool-result token limit and spills to a file on disk** — the tool result
  tells you the path. That is not an error.

## 2. PUT the bytes

Nothing uploads until you send them.

```
curl -X PUT -H "Content-Type: image/png" --data-binary @FILE 'UPLOAD_URL'
```

Expect `200`. For a spilled response use `scripts/doupload.py`, which regexes the filename out of
each `instructions` string, PUTs, and records `{filename: media_id}` to a map you reuse when
building the batch. When the response came back inline instead, write the `filename|url` pairs to a
temp file with a heredoc and loop the same curl over it — do not paste a presigned URL into a
command line unquoted, the `&` will fork it.

## 3. media_confirm

```jsonc
{ "type": "image", "media_ids": ["…", "…"] }
```

Only after every PUT returned 200. Confirm up to 20 at once.

## 4. generate_image_batch

The shape that works — note `params` is a **nested object**, not flat keys:

```jsonc
{
  "requests": [
    {
      "index": 1,
      "params": {
        "model": "nano_banana_pro",
        "quality": "2k",
        "aspect_ratio": "4:5",
        "medias": [
          { "value": "<media_id or prior job_id>", "role": "image_references" },
          { "value": "<media_id>", "role": "image_references" }
        ],
        "prompt": "SHOT — …"
      }
    }
  ]
}
```

- **Max 12 requests per call.** More than twelve frames means more than one submission; keep your
  own indices stable across submissions so the results still map to SKUs.
- `index` is yours to choose and comes back on the job. Use it to carry the frame number. When you
  resubmit a fixed version, use a **fresh index range** (12–17 for the second pass of frames 0–5)
  so a stale `jobs_wait` cannot silently collide.
- **`medias` is easy to forget.** A prompt full of "IMAGE 1 is the authority…" with no `medias`
  array still submits happily, still charges, and comes back as a generic stock photo. Check the
  array is present in every request before sending.
- 2 credits per 2K image. Check `balance` before a big batch.
- Some submissions fail at the gateway with 401/404/405 for no visible reason. Resubmit that index
  with slightly softened phrasing; it usually goes through.

## 5. jobs_wait

```jsonc
{ "jobs": [ { "index": 1, "job_id": "…" }, … ], "timeout_seconds": 15 }
```

- **`jobs`, not `job_ids`.** **Max 15 seconds**, not 180. Call it repeatedly until `all_terminal`.
- A 2K Nano Banana Pro frame takes roughly 30–90s, so expect two to six polls.
- Results come back as URLs. Download with curl and keep the bytes — the URLs expire.

## Model

`nano_banana_pro`. It reports itself back as `nano_banana_2`; that is the same model, not a
downgrade. 4:5, 2K, one product per frame.
