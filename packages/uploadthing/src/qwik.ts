import type { RequestHandler } from "@builder.io/qwik-city";

import type { Json } from "@uploadthing/shared";
import { getStatusCodeFromError, UploadThingError } from "@uploadthing/shared";

import { UPLOADTHING_VERSION } from "./constants";
import { defaultErrorFormatter } from "./internal/error-formatter";
import type { RouterWithConfig } from "./internal/handler";
import {
  buildPermissionsInfoHandler,
  buildRequestHandler,
} from "./internal/handler";
import type { FileRouter, inferErrorShape } from "./internal/types";
import type { CreateBuilderOptions } from "./internal/upload-builder";
import { createBuilder } from "./internal/upload-builder";

export type { FileRouter } from "./internal/types";

export const createUploadthing = <TErrorShape extends Json>(
  opts?: CreateBuilderOptions<TErrorShape>,
) => createBuilder<"app", TErrorShape>(opts);

export const createQwikRouteHandler = <TRouter extends FileRouter>(
  opts: RouterWithConfig<TRouter>,
) => {
  const requestHandler = buildRequestHandler<TRouter, "app">(opts);

  const onPost: RequestHandler = async ({ json, headers, request: req }) => {
    const response = await requestHandler({ req });
    const errorFormatter =
      opts.router[Object.keys(opts.router)[0]]?._def.errorFormatter ??
      defaultErrorFormatter;

    headers.set("x-uploadthing-version", UPLOADTHING_VERSION);

    if (response instanceof UploadThingError) {
      const formattedError = errorFormatter(
        response,
      ) as inferErrorShape<TRouter>;

      json(getStatusCodeFromError(response), formattedError);

      return;
    }

    if (response.status !== 200) {
      json(500, "An unknown error occured");

      return;
    }

    json(response.status, response.body);
  };

  const getBuildPerms = buildPermissionsInfoHandler<TRouter>(opts);

  const onGet: RequestHandler = async ({ json, headers }) => {
    headers.set("x-uploadthing-version", UPLOADTHING_VERSION);

    json(200, getBuildPerms());
  };

  return { onGet, onPost };
};
