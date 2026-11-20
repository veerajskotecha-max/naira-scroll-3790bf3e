import { Minus, Plus } from "lucide-react";

/*
  The quantity stepper: minus, the number, plus, in one hairline box 40px
  high. Each button's target reaches 44px without moving its neighbours.
  What a tap does is the caller's: the bag removes the line when minus is
  pressed at one, and names the button so (`decreaseLabel`).
*/
type Props = {
  quantity: number;
  onDecrease: () => void;
  onIncrease: () => void;
  disabled?: boolean;
  decreaseLabel?: string;
  increaseLabel?: string;
  className?: string;
};

const CleanStepper = ({
  quantity,
  onDecrease,
  onIncrease,
  disabled = false,
  decreaseLabel = "Decrease quantity",
  increaseLabel = "Increase quantity",
  className = "",
}: Props) => (
  <div className={`nc-stepper ${className}`.trim()}>
    <button type="button" onClick={onDecrease} disabled={disabled} aria-label={decreaseLabel}>
      <Minus size={14} strokeWidth={1.25} aria-hidden="true" />
    </button>
    <output aria-label={`Quantity ${quantity}`}>{quantity}</output>
    <button type="button" onClick={onIncrease} disabled={disabled} aria-label={increaseLabel}>
      <Plus size={14} strokeWidth={1.25} aria-hidden="true" />
    </button>
  </div>
);

export default CleanStepper;
