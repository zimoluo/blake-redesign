import SidebarToggle from "@/components/ui/lightbox/toolbar/sidebar-toggle";
import containerStyle from "./container.module.css";
import SidebarWrapper from "@/components/ui/lightbox/sidebar-wrapper";

interface Props {
  children?: React.ReactNode;
}

export default function LightboxLayout({ children }: Props) {
  return (
    <div className={`${containerStyle.bigBox} px-6 py-4`}>
      <div
        className={`flex h-full w-full p-2 border-reflect ${containerStyle.borderContainer} ${containerStyle.bgContainer} shadow-xl/5 rounded-3xl text-dark`}
      >
        <div
          className={`rounded-[1rem_0.65rem_0.65rem_1rem] ${containerStyle.bg} ${containerStyle.borderAdjust} h-full mr-2 flex-grow border-reflect`}
        >
          awa
        </div>
        <SidebarWrapper>
          <div
            className={`rounded-[0.65rem] ${containerStyle.bg} ${containerStyle.borderAdjust} w-full h-full border-reflect`}
          >
            awa
          </div>
        </SidebarWrapper>
        <div
          className={`rounded-[0.65rem_1rem_1rem_0.65rem] ${containerStyle.bg} ${containerStyle.borderAdjust} h-full w-12 border-reflect`}
        >
          <div
            className={`w-full h-full flex flex-col items-center ${containerStyle.buttonContainer} overflow-x-hidden overflow-y-auto py-2 gap-2`}
          >
            <SidebarToggle />
          </div>
        </div>
      </div>
    </div>
  );
}
