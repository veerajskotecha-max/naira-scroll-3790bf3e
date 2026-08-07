"""Apply the findings of the three-photo audit to the tracker.

The first pass compared each SKU against one supplier photo. Every SKU folder
actually holds three, and the second and third carry the side profile, the
clean packshot and the true metal colour - which is where these four defects
were hiding.
"""
import json

P = "/home/user/naira-scroll-3790bf3e/scripts/higgsfield/supplier-tracker.json"
CDN = "https://d8j0ntlcm91z4.cloudfront.net/user_3AEDqJMErZwqraYM5k7B7luVWcH/"

FIX = {
    "JDR0104333": {
        "frames": {
            "ecom": "hf_20260806_182909_204ae468-71fa-49b9-97d6-5a7784a6dc52",
            "worn": "hf_20260806_181957_a79e456f-65de-4e30-adf1-f2f231a283da",
            "angle": "hf_20260806_181957_70022d9c-0705-409b-a4b9-b6d130468b11",
        },
        "size": ("US 6-8 adjustable - three stones: 10 x 7mm pear, 6mm princess "
                 "and 10 x 5mm marquise zircons in gold claws"),
        "why": ("the ring carries THREE stones - a pear, a princess and a marquise - and all "
                "three frames rendered only two, dropping the marquise terminal. The recorded "
                "size named only two stones as well, so the description was wrong before the "
                "prompt was. Re-shot with all three cuts named and counted."),
    },
    "JDE0110042": {
        "frames": {
            "ecom": "hf_20260806_181957_aa1ffc4e-54a0-4996-acdd-3396d12dddb5",
            "worn": "hf_20260806_181957_c9b7e3bc-d6cd-4b81-b788-ff74f752ed12",
            "angle": "hf_20260806_181957_8ce41e84-9242-447c-8311-929b3881a6b8",
        },
        "size": "hoop ~20mm across - rhodium-plated silver, twisted molten surface, no stones",
        "why": ("all three supplier photos show this hoop in rhodium-plated SILVER and every "
                "frame rendered it in yellow gold - a straight violation of the colour lock. "
                "Re-shot with the metal stated as silver and the warm set told not to tint it."),
    },
    "E21572E1": {
        "frames": {"worn": "hf_20260806_181957_8fe71f3f-151e-4780-bed0-a6644923f7e3"},
        "why": ("the worn frame bled the stone's blue-green onto the model's jaw and neck as a "
                "soft coloured patch. Re-shot with the skin explicitly held to its own tone and "
                "the colour kept inside the stone."),
    },
    "JDB201083": {
        "frames": {
            "ecom": "hf_20260806_182356_c8bdf869-df36-4a5a-8394-e521bb89c10c",
            "worn": "hf_20260806_182356_23be3264-b5b6-4300-987d-93822441abdd",
            "angle": "hf_20260806_182356_c6331947-3d97-42bd-975e-b8e7d2dc975d",
        },
        "name": "Fine Chain Circle Station Bracelet",
        "size": ("~17cm - 1mm fine gold cable chain with a single 8mm open circle station "
                 "ringed in tiny round zircons"),
        "why": ("wrong product. The first two photos for this code are a stacked-wrist shot "
                "shared with JDB201210 and JDB201210-GN, and the frames were built from one of "
                "the tennis bracelets in that stack. The third photo is a single-product shot "
                "and shows something else entirely: a fine chain carrying one small open circle "
                "station. Re-shot from that photo, which was uploaded to Higgsfield as its own "
                "reference."),
    },
}

t = json.load(open(P))
for sku, fix in FIX.items():
    v = t["done"][sku]
    for shot, stem in fix["frames"].items():
        v[shot] = CDN + stem + ".png"
    if "size" in fix:
        v["size"] = fix["size"]
    if "name" in fix:
        v["name"] = fix["name"]
    v["accuracy_correction"] = fix["why"]

t["sizing_audit"]["round_4_three_photo_audit_2026_08_06"] = {
    "_method": (
        "Every SKU folder in the shared Drive holds three photos, not one. The earlier passes "
        "only ever compared against the first. All 152 supplier photos were pulled down and each "
        "delivered SKU was put beside its full photo set - first shot, clean packshot and "
        "on-model - and looked at. The clean packshot is where a missing stone or a wrong metal "
        "shows; the third shot is where a shared stack photo stops standing in for the product."),
    "skus_checked": 64,
    "frames_checked": 192,
    "passed": 182,
    "failed_and_reshot": {k: v["why"] for k, v in FIX.items()},
    "_note": (
        "None of these four would have been caught by the URL check or the sizing audit. Two of "
        "them - the silver hoop and the wrong bracelet - were invisible in the first photo and "
        "only appeared once the second and third were in front of the eye."),
}
json.dump(t, open(P, "w"), indent=2, ensure_ascii=False)
print("patched", len(FIX), "SKUs |", sum(len(f["frames"]) for f in FIX.values()), "frames")
