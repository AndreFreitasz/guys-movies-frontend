import React from "react";
import Button from "../../button";

type ButtonSubmitProps = {
  label: string;
  className?: string;
  isLoading?: boolean;
};

const ButtonSubmit: React.FC<ButtonSubmitProps> = ({
  label,
  className,
  isLoading,
}) => (
  <Button
    type="submit"
    label={label}
    variant="primary"
    size="lg"
    shape="rounded"
    isLoading={isLoading}
    className={`flex-1 ${className ?? ""}`}
  />
);

export default ButtonSubmit;
