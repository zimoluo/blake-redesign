import SidebarToggle from "@/components/ui/lightbox/toolbar/sidebar-toggle";
import containerStyle from "./container.module.css";
import SidebarWrapper from "@/components/ui/lightbox/sidebar-wrapper";
import { LightboxProvider } from "@/components/context/lightbox-context";
import LightboxCanvas from "@/components/ui/lightbox/lightbox-canvas";

export default function LightboxLayout() {
  return (
    <LightboxProvider>
      <div className={`${containerStyle.bigBox} px-1 py-1 md:px-4 md:py-4`}>
        <div
          className={`grid ${containerStyle.mobileGrid} md:flex h-full w-full p-3 border-reflect ${containerStyle.borderContainer} ${containerStyle.bgContainer} shadow-xl/5 rounded-3xl text-dark`}
        >
          <div
            className={`rounded-2xl ${containerStyle.bg} ${containerStyle.borderAdjust} h-full md:mr-3 flex-grow border-reflect overflow-hidden p-px`}
          >
            <LightboxCanvas />
          </div>
          <SidebarWrapper>
            <div
              className={`rounded-2xl ${containerStyle.bg} ${containerStyle.borderAdjust} w-full md:w-48 h-full border-reflect`}
            >
              this will hold the layers
            </div>
          </SidebarWrapper>
          <div
            className={`rounded-2xl ${containerStyle.bg} ${containerStyle.borderAdjust} h-full w-12 border-reflect`}
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
