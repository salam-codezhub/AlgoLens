import type { ReactElement } from "react";
import { RouterProvider } from "react-router";
import { AppProviders } from "./providers/app-providers.js";
import { router } from "./routes/router.js";

export function App(): ReactElement {
  return (
    <AppProviders>
      <RouterProvider router={router} />
    </AppProviders>
  );
}
