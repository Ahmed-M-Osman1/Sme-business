export default function QuoteLayout({
  children,
}: Readonly<{children: React.ReactNode}>) {
  return (
    <div className="flex-1 flex flex-col min-h-0">
      <div className="flex-1 flex flex-col py-8 bg-surface relative">
        {children}
      </div>
    </div>
  );
}
