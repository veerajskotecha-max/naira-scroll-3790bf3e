import css from "./renew.css?inline";

/*
  The renewed page's layer (renew.css), written into the page after the clean
  system's stylesheet and the page's own, as those are: the pre-built page
  carries it in its HTML and the first paint is already right.
*/
const RenewStyles = () => <style data-nf-renew="" dangerouslySetInnerHTML={{ __html: css }} />;

export default RenewStyles;
