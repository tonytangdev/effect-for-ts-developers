import { Header } from "@/components/header";
import { ProgressProvider } from "@/components/progress-provider";

export default function PhaseLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ProgressProvider>
      <Header />
      {children}
    </ProgressProvider>
  );
}
