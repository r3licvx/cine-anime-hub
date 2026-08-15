import { IconAlert, IconSearch } from "./icons";

export function ErrorState({
  message = "Something went wrong while loading anime.",
  onRetry,
}: {
  message?: string;
  onRetry?: () => void;
}) {
  return (
    <div className="fade-up glass mx-auto my-16 flex max-w-md flex-col items-center gap-3 rounded-2xl p-8 text-center">
      <span className="rounded-full bg-destructive/15 p-3 text-destructive">
        <IconAlert width={22} height={22} />
      </span>
      <h3 className="text-base font-semibold">Couldn't load this</h3>
      <p className="text-sm text-muted-foreground">{message}</p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="mt-1 rounded-full bg-primary px-5 py-2 text-sm font-semibold text-primary-foreground transition hover:brightness-110"
        >
          Try again
        </button>
      )}
    </div>
  );
}

export function EmptyState({ title, hint }: { title: string; hint?: string }) {
  return (
    <div className="fade-up mx-auto my-16 flex max-w-md flex-col items-center gap-3 text-center">
      <span className="glass rounded-full p-4 text-muted-foreground">
        <IconSearch width={22} height={22} />
      </span>
      <h3 className="text-base font-semibold">{title}</h3>
      {hint && <p className="text-sm text-muted-foreground">{hint}</p>}
    </div>
  );
}

export function PageHeading({
  eyebrow,
  title,
  description,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
}) {
  return (
    <div className="fade-up mb-6">
      {eyebrow && (
        <p className="text-xs font-semibold tracking-[0.2em] text-primary uppercase">{eyebrow}</p>
      )}
      <h1 className="mt-1 text-2xl font-extrabold tracking-tight md:text-4xl">{title}</h1>
      {description && (
        <p className="mt-2 max-w-2xl text-sm text-muted-foreground md:text-base">{description}</p>
      )}
    </div>
  );
}