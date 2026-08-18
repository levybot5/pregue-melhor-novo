import { ImageResponse } from "next/og";
import { getIconDataUri } from "@/lib/brand-icon";

export const size = { width: 512, height: 512 };
export const contentType = "image/png";

export function GET() {
  return new ImageResponse(
    (
      <img
        alt=""
        src={getIconDataUri()}
        width={size.width}
        height={size.height}
        style={{ objectFit: "cover" }}
      />
    ),
    { ...size },
  );
}
