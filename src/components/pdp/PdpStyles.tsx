import css from "./pdp.css?inline";

/*
  The product page's own few rules (pdp.css), written into the page after the
  clean system's stylesheet, as that one is: the pre-built page carries them
  in its HTML and the first paint is already right.
*/
const PdpStyles = () => <style data-nf-pdp="" dangerouslySetInnerHTML={{ __html: css }} />;

export default PdpStyles;
