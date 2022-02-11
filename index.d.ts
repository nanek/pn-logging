declare module "pn-logging" {
  type sysLogLevels =
    | "emerg"
    | "alert"
    | "crit"
    | "error"
    | "warning"
    | "notice"
    | "info"
    | "debug";

  type LoggingParameters = Parameters<
    (
      message: string,
      meta?: object,
      err?: unknown,
      req?: Express.Request,
      res?: Express.Request
    ) => void
  >;

  type ILog = {
    [Action in sysLogLevels]: (...args: LoggingParameters) => void;
  };

  export class Log implements ILog {
    constructor(options: unknown);
    emerg(...args: LoggingParameters): void;
    alert(...args: LoggingParameters): void;
    crit(...args: LoggingParameters): void;
    error(...args: LoggingParameters): void;
    warning(...args: LoggingParameters): void;
    notice(...args: LoggingParameters): void;
    info(...args: LoggingParameters): void;
    debug(...args: LoggingParameters): void;
    middleware(): (req: any, res: any, next: any) => any;
  }
}
