import Image from "next/image";

export function LogoHeader() {
  return (
    <header className="logo-header">
      <Image src="/assets/logo-aigs-v2.png" alt="AI Growth Studio" width={190} height={64} priority />
    </header>
  );
}
