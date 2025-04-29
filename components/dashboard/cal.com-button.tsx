import { getCalApi } from "@calcom/embed-react";
import { useEffect } from "react";

export default function MyApp() {
  useEffect(() => {
    (async function () {
      const cal = await getCalApi({
        namespace: "interview-with-behrooz-evans",
      });
      cal("ui", {
        theme: "dark",
        cssVarsPerTheme: {
          dark: { "cal-brand": "#000000" },
          light: { "cal-brand": "#000000" },
        },
        hideEventTypeDetails: false,
        layout: "month_view",
      });
    })();
  }, []);
  return (
    <button
      data-cal-namespace="interview-with-behrooz-evans"
      data-cal-link="behevans/interview-with-behrooz-evans"
      data-cal-config='{"layout":"month_view","theme":"dark"}'
    >
      Click me
    </button>
  );
}
