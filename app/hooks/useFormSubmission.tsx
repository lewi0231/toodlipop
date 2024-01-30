import { useFetcher } from "@remix-run/react";

export const useFormSubmission = () => {
  const fetcher = useFetcher();

  const submit = ({ intent, object }: { intent: string; object: object }) => {
    const formData = new FormData();
    formData.append("intent", intent);
    for (const [key, value] of Object.entries(object)) {
      formData.append(key, value);
    }
    fetcher.submit(formData, { method: "post" });
  };

  return { submit };
};
