const DemoEmbed = () => {
  return (
    <div
      className="relative w-full max-w-2xl h-96 lg:h-[28rem] rounded-xl overflow-hidden border border-border/30 bg-gradient-to-br from-background/50 to-background/20 backdrop-blur-sm"
    >
      {/* Glow effect */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-accent/10" />

      {/* Demo content placeholder */}
      <div className="relative h-full flex flex-col">
        {/* Demo header */}
        <div className="flex items-center justify-between p-4 border-b border-border/20">
          <div className="flex space-x-2">
            <div className="w-3 h-3 rounded-full bg-red-500" />
            <div className="w-3 h-3 rounded-full bg-yellow-500" />
            <div className="w-3 h-3 rounded-full bg-green-500" />
          </div>
          <div className="text-xs text-muted-foreground">demo.ckpayment.xyz</div>
          <div className="w-16" /> {/* Spacer for flex alignment */}
        </div>

        {/* Demo content */}
        <div className="flex-1 flex items-center justify-center p-6">
          <div className="text-center">
            <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-gradient-to-br from-primary to-accent p-0.5">
              <div className="w-full h-full rounded-full bg-background flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary">
                  <path d="M12 2v8" />
                  <path d="m17 7 1.5 1.5" />
                  <path d="M22 12h-8" />
                  <path d="m17 17 1.5-1.5" />
                  <path d="M12 22v-8" />
                  <path d="m7 17-1.5-1.5" />
                  <path d="M2 12h8" />
                  <path d="m7 7-1.5 1.5" />
                </svg>
              </div>
            </div>
            <h3 className="text-xl font-semibold text-foreground mb-2">Live Demo</h3>
            <p className="text-sm text-muted-foreground max-w-xs">Experience seamless Web3 payments in action</p>

            {/* Animated progress bar */}
            <div className="mt-8 w-full max-w-xs mx-auto h-2 bg-background/50 rounded-full overflow-hidden">
              <div className="h-full w-full bg-gradient-to-r from-primary to-accent rounded-full animate-pulse"></div>
            </div>

            {/* Network nodes animation */}
            <div className="mt-6 flex justify-center space-x-8">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="w-3 h-3 rounded-full bg-foreground/20 animate-pulse"
                  style={{
                    animationDelay: `${i * 0.2}s`,
                    animationDuration: '1.5s',
                    animationIterationCount: 'infinite',
                  }}
                />
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Glow effect */}
      <div className="absolute -inset-1 bg-gradient-to-br from-primary/20 to-accent/20 rounded-xl blur-xl opacity-70 -z-10" />
    </div>
  );
};

export default DemoEmbed;
