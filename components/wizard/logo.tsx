import Image from "next/image";

export function WizardLogo() {
  return (
    <div className="flex flex-col items-center mb-10">
      <Image
        src="/logo.svg"
        alt="Collabute"
        width={51}
        height={51}
        className="w-12 h-12"
      />
      <h2 className="text-white text-2xl mt-2 font-bold">Collabute</h2>
    </div>
  );
} 