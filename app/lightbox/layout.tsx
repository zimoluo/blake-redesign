import SidebarToggle from "@/components/ui/lightbox/toolbar/sidebar-toggle";
import containerStyle from "./container.module.css";
import SidebarWrapper from "@/components/ui/lightbox/sidebar-wrapper";
import { LightboxProvider } from "@/components/context/lightbox-context";
import LightboxCanvas from "@/components/ui/lightbox/lightbox-canvas";

export default function LightboxLayout() {
  return (
    <LightboxProvider>
      <div className={`${containerStyle.bigBox} px-6 py-3`}>
        <div
          className={`grid ${containerStyle.mobileGrid} md:flex h-full w-full p-3 border-reflect ${containerStyle.borderContainer} ${containerStyle.bgContainer} shadow-xl/5 rounded-3xl text-dark`}
        >
          <div
            className={`rounded-[1rem_1rem_0.65rem_0.65rem] md:rounded-[1rem_0.65rem_0.65rem_1rem] ${containerStyle.bg} ${containerStyle.borderAdjust} h-full md:mr-3 flex-grow border-reflect overflow-hidden`}
          >
            <LightboxCanvas />
          </div>
          <SidebarWrapper>
            <div
              className={`rounded-[0.65rem_0.65rem_0.65rem_1rem] md:rounded-[0.65rem] ${containerStyle.bg} ${containerStyle.borderAdjust} w-full md:w-48 h-full border-reflect`}
            >
              this will hold the layers
            </div>
          </SidebarWrapper>
          <div
            className={`rounded-[0.65rem_0.65rem_1rem_0.65rem] md:rounded-[0.65rem_1rem_1rem_0.65rem] ${containerStyle.bg} ${containerStyle.borderAdjust} h-full w-12 border-reflect`}
          >
            <div
              className={`w-full h-full flex flex-col items-center ${containerStyle.buttonContainer} overflow-x-hidden overflow-y-auto py-2 gap-2`}
            >
              <SidebarToggle />
            </div>
          </div>
        </div>
      </div>
    </LightboxProvider>
  );
}
