import Image from "next/image";

interface LogoProps {
  /** "full" = logo entero con texto | "icon" = solo icono cuadrado */
  variant?: "full" | "icon";
  className?: string;
  /** Alto en px para el logo entero (el ancho se calcula automáticamente) */
  height?: number;
}

/**
 * Logo de easy-CRM.
 * - En light mode: versión negra  (logos-entero-negro / logos-negro-simple)
 * - En dark mode:  versión blanca (logos-entero-blanco / logos-blanco-simple)
 */
export function AppLogo({ variant = "full", className = "", height = 32 }: LogoProps) {
  if (variant === "icon") {
    return (
      <>
        {/* Light */}
        <Image
          src="/logos-negro-simple.png"
          alt="easy-CRM"
          width={36}
          height={36}
          className={`block dark:hidden ${className}`}
          priority
        />
        {/* Dark */}
        <Image
          src="/logos-blanco-simple.png"
          alt="easy-CRM"
          width={36}
          height={36}
          className={`hidden dark:block ${className}`}
          priority
        />
      </>
    );
  }

  return (
    <>
      {/* Light */}
      <Image
        src="/logos-entero-negro.png"
        alt="easy-CRM"
        height={height}
        width={height * 4}
        style={{ width: "auto", height: `${height}px` }}
        className={`block dark:hidden ${className}`}
        priority
      />
      {/* Dark */}
      <Image
        src="/logos-entero-blanco.png"
        alt="easy-CRM"
        height={height}
        width={height * 4}
        style={{ width: "auto", height: `${height}px` }}
        className={`hidden dark:block ${className}`}
        priority
      />
    </>
  );
}
