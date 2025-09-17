import { Metadata } from "next";
import Form from "@/components/Form";

export const metadata: Metadata = {
  title: "Contact Us | My Website",
  description: "Learn more about our company and mission.",
};

export default function ContactPage() {
  return (
    <main>
      <div className="h-[80vh] container mx-auto padding-global grid grid-cols-2 place-items-center gap-10">
        <div className="flex flex-col gap-5">
          <p className="body-text-lg font-bold">
            Feel free to reach us using any of the following methods:
          </p>
          <ul className="flex flex-col gap-2">
            <li>
              Tel:
              <a
                href="tel:+351915006659"
                className="text-blue-500 hover:text-blue-700 underline underline-offset-1 hover:underline-offset-0"
              >
                +351 915 006 659
              </a>
            </li>
            <li>
              Email:
              <a
                href="mailto:weareopac@gmail.com"
                className="text-blue-500 hover:text-blue-700 underline underline-offset-1 hover:underline-offset-0"
              >
                weareopac@gmail.com
              </a>
            </li>
          </ul>
        </div>
        <Form />
      </div>
    </main>
  );
}
