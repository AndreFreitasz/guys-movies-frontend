import React from "react";
import Button from "../../button";

type ButtonCancelProps = {
  label: string;
  onClick: () => void;
  className?: string;
};

const ButtonCancel: React.FC<ButtonCancelProps> = ({
  label,
  onClick,
  className,
}) => (
  <Button
    label={label}
    onClick={onClick}
    variant="secondary"
    size="lg"
    shape="rounded"
    className={className}
  />
);

export default ButtonCancel;
