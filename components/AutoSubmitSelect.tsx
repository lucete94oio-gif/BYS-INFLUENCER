"use client";

import { useRef } from "react";

export default function AutoSubmitSelect({
  name,
  defaultValue,
  options,
  className,
}: {
  name: string;
  defaultValue: string;
  options: { value: string; label: string }[];
  className?: string;
}) {
  const formRef = useRef<HTMLFormElement>(null);
  return (
    <select
      name={name}
      defaultValue={defaultValue}
      className={className}
      onChange={(e) => {
        formRef.current = e.currentTarget.form;
        formRef.current?.requestSubmit();
      }}
    >
      {options.map((o) => (
        <option key={o.value} value={o.value}>
          {o.label}
        </option>
      ))}
    </select>
  );
}
