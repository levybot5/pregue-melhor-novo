import { ImageResponse } from "next/og";
import { getIconDataUri } from "@/lib/brand-icon";

export const size = { width: 32, height: 32 };
export const contentType = "image/png";

export default function Icon() {
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
