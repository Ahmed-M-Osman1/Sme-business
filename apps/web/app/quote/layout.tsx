export default function QuoteLayout({
  children,
}: Readonly<{children: React.ReactNode}>) {
  return (
    <div className="flex-1 flex flex-col py-8">
      {children}
    </div>
  );
}
