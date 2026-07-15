import * as React from "react";
import { Label } from "./input";

// Medan borang Nadi — Label + kawalan + mesej ralat/petunjuk berwayar a11y.
// Menyuntik `aria-invalid` + `aria-describedby` pada kawalan anak (atribut aria
// SAHAJA — ref & props react-hook-form dari register() tidak disentuh).
type A11yProps = { "aria-invalid"?: boolean; "aria-describedby"?: string };

export interface FieldProps {
  label?: React.ReactNode;
  htmlFor?: string;
  error?: string;
  hint?: React.ReactNode;
  className?: string;
  children: React.ReactNode;
}

export function Field({ label, htmlFor, error, hint, className, children }: FieldProps) {
  const hintId = htmlFor && hint && !error ? `${htmlFor}-hint` : undefined;
  const errorId = htmlFor && error ? `${htmlFor}-error` : undefined;
  const describedBy = [hintId, errorId].filter(Boolean).join(" ") || undefined;

  let control = children;
  if (React.isValidElement(children) && (error || describedBy)) {
    const child = children as React.ReactElement<A11yProps>;
    const existing = child.props["aria-describedby"];
    control = React.cloneElement(child, {
      "aria-invalid": error ? true : child.props["aria-invalid"],
      "aria-describedby": [existing, describedBy].filter(Boolean).join(" ") || undefined,
    });
  }

  return (
    <div className={className}>
      {label && (
        <Label htmlFor={htmlFor} className="mb-1.5">
          {label}
        </Label>
      )}
      {control}
      {error ? (
        <p id={errorId} className="mt-1.5 flex items-center gap-1 text-xs font-medium text-destructive">
          {error}
        </p>
      ) : hint ? (
        <p id={hintId} className="mt-1.5 text-xs text-muted-foreground">
          {hint}
        </p>
      ) : null}
    </div>
  );
}
