import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import type { JewelPiece } from "@/data/jewellery";

/* Quick view has been retired — jewellery now uses a single product page.
   This shim preserves the previous API: whenever a caller opens it, we
   navigate straight to the piece's PDP and immediately close. */
const JewelQuickView = ({
  piece,
  open,
  onOpenChange,
}: {
  piece: JewelPiece | null;
  open: boolean;
  onOpenChange: (o: boolean) => void;
}) => {
  const navigate = useNavigate();
  useEffect(() => {
    if (open && piece) {
      onOpenChange(false);
      navigate(`/jewellery/${piece.handle}`);
    }
  }, [open, piece, navigate, onOpenChange]);
  return null;
};

export default JewelQuickView;
