import LightboxSidebarToggle from "@/components/ui/lightbox/toolbar/sidebar-toggle";
import containerStyle from "./container.module.css";
import SidebarWrapper from "@/components/ui/lightbox/sidebar-wrapper";
import { LightboxProvider } from "@/components/context/lightbox-context";
import LightboxCanvas from "@/components/ui/lightbox/lightbox-canvas";
import LightboxModeSwitch from "@/components/ui/lightbox/toolbar/mode-switch";

export default function LightboxLayout() {
  return (
    <LightboxProvider>
      <div className={`${containerStyle.bigBox} px-0 py-0 md:px-4 md:py-4`}>
        <div
          className={`grid ${containerStyle.mobileGrid} md:flex h-full w-full p-3 border-reflect ${containerStyle.borderContainer} ${containerStyle.bgContainer} shadow-xl/5 md:rounded-3xl text-dark`}
        >
          <div
            className={`rounded-2xl ${containerStyle.bg} ${containerStyle.borderAdjust} h-full md:mr-3 flex-grow border-reflect overflow-hidden p-px shadow-xl/5`}
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
            className={`rounded-2xl ${containerStyle.bg} ${containerStyle.borderAdjust} h-full w-12 border-reflect shadow-xl/5`}
          >
            <div
              className={`w-full h-full flex flex-col items-center ${containerStyle.buttonContainer} overflow-x-hidden overflow-y-auto py-3.5 gap-3.5`}
            >
              <LightboxSidebarToggle />
              <hr className="w-2/5 h-[2px] rounded-full bg-dark opacity-50 border-0 hidden md:block" />
              <LightboxModeSwitch mode="scale" />
              <LightboxModeSwitch mode="rotate" />
              <LightboxModeSwitch mode="skew" />
              <LightboxModeSwitch mode="crop" />
            </div>
          </div>
        </div>
      </div>
    </LightboxProvider>
  );
}
