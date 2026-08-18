import { ImageResponse } from "next/og";
import { getIconDataUri } from "@/lib/brand-icon";

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

export default function AppleIcon() {
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
