import css from "./clean.css?inline";

/*
  The clean system's stylesheet, written into the page by whichever root uses
  it (the product page, the bag). In the page rather than in a file of its
  own, so the pre-built product page carries it in its HTML: the first paint
  is already styled and costs no extra request. Two roots on screen at once
  write it twice, which changes nothing.
*/
const CleanStyles = () => <style data-nf-clean="" dangerouslySetInnerHTML={{ __html: css }} />;

export default CleanStyles;
