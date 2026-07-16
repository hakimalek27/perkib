// Jenis Rule minimum untuk validation skema (elak `any`, kekal ditaip).
export type Rule = {
  required: () => Rule;
  min: (n: number) => Rule;
  max: (n: number) => Rule;
  regex: (re: RegExp, opts?: { name?: string; invert?: boolean }) => Rule;
  integer: () => Rule;
  email: () => Rule;
  error: (msg: string) => Rule;
  warning: (msg: string) => Rule;
  custom: (
    fn: (value: unknown, context: { parent?: Record<string, unknown> }) => true | string
  ) => Rule;
};
