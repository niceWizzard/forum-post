import { Loader2 } from "lucide-react";
import { Button, ButtonProps } from "./button";

interface LoadingButtonProps extends ButtonProps {
  isLoading?: boolean;
  loadingText?: string;
  disabledOnLoading?: boolean;
  loadingIcon?: React.ReactNode;
}

export const LoadingButton = ({
  isLoading,
  loadingText,
  disabledOnLoading,
  loadingIcon,
  disabled,
  ...props
}: LoadingButtonProps) => {
  const loadingComp = (
    <span className="flex items-center justify-center">
      {loadingIcon ?? <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
      {loadingText ?? "Loading..."}
    </span>
  );
  return (
    <Button
      disabled={
        disabledOnLoading == undefined
          ? isLoading
          : disabledOnLoading
          ? isLoading
          : disabled
      }
      {...props}
    >
      {isLoading ? loadingComp : props.children}
    </Button>
  );
};
