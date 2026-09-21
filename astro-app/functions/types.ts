export interface PagesContext<Env extends Record<string, string | undefined> = Record<string, string | undefined>> {
  request: Request
  env: Env
  next: () => Promise<Response>
}

export type PagesFunction<Env extends Record<string, string | undefined> = Record<string, string | undefined>> = (
  context: PagesContext<Env>,
) => Response | Promise<Response>
