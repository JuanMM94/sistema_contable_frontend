'use client';

export default function LastMovementLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <div className="flex justify-center w-full !mt-6">{children}</div>;
}
