interface MinimapProps {
  worldWidth: number;
  worldHeight: number;
  viewportWidth: number;
  viewportHeight: number;
  offsetX: number;
  offsetY: number;
  onNavigate: (x: number, y: number) => void;
}

const MINIMAP_W = 64;
const MINIMAP_H = 86;

const Minimap = ({
  worldWidth,
  worldHeight,
  viewportWidth,
  viewportHeight,
  offsetX,
  offsetY,
  onNavigate,
}: MinimapProps) => {
  const scaleX = MINIMAP_W / worldWidth;
  const scaleY = MINIMAP_H / worldHeight;

  const vpW = viewportWidth * scaleX;
  const vpH = viewportHeight * scaleY;
  const vpX = -offsetX * scaleX;
  const vpY = -offsetY * scaleY;

  const handleClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const clickY = e.clientY - rect.top;
    const worldX = -(clickX / scaleX - viewportWidth / 2);
    const worldY = -(clickY / scaleY - viewportHeight / 2);
    onNavigate(worldX, worldY);
  };

  return (
    <div
      onClick={handleClick}
      className="absolute top-4 right-4 z-40 rounded-lg bg-foreground/10 backdrop-blur-sm border border-border/50 cursor-pointer overflow-hidden"
      style={{ width: MINIMAP_W, height: MINIMAP_H }}
    >
      {/* Viewport indicator */}
      <div
        className="absolute rounded-sm border-2 border-foreground/60 bg-foreground/10"
        style={{
          left: vpX,
          top: vpY,
          width: vpW,
          height: vpH,
        }}
      />
      {/* Center dot for home */}
      <div
        className="absolute w-1.5 h-1.5 rounded-full bg-foreground/40"
        style={{
          left: MINIMAP_W / 2 - 3,
          top: 50 * scaleY,
        }}
      />
    </div>
  );
};

export default Minimap;
