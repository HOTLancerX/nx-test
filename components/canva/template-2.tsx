import Image from "next/image"
import type React from "react"

interface TemplateProps {
  data: {
    title: string
    content: string
    images: string
    watermark: string
    date: string
    userName: string
    userImage: string
  }
  styles: {
    bgType: "gradient" | "solid" | "image"
    gradient1: string
    gradient2: string
    gradientAngle: number
    solidColor: string
    backgroundImage: string
    titleColor: string
    highlightColor: string
    titleFontSize: number
    descriptionColor: string
    descriptionFontSize: number
    dateColor: string
    userColor: string
  }
  parseTitle: (title: string, highlightColor: string, defaultColor: string) => React.ReactNode
}

export default function Template2({ data, styles, parseTitle }: TemplateProps) {
  const backgroundStyle: React.CSSProperties = {}
  if (styles.bgType === "gradient") {
    backgroundStyle.background = `linear-gradient(${styles.gradientAngle}deg, ${styles.gradient1}, ${styles.gradient2})`
  } else if (styles.bgType === "solid") {
    backgroundStyle.backgroundColor = styles.solidColor
  } else if (styles.bgType === "image") {
    backgroundStyle.backgroundImage = `url(${styles.backgroundImage})`
    backgroundStyle.backgroundSize = "cover"
    backgroundStyle.backgroundPosition = "center"
  }

  return (
    <div
      className="relative w-full h-full flex flex-col items-center justify-center p-8 text-center overflow-hidden"
      style={backgroundStyle}
    >
      {data.images && (
        <Image
          src={data.images}
          width={800}
          height={600}
          alt="Post"
          className=""
          style={{ zIndex: 0 }}
        />
      )}
      <div className="relative z-10 text-white">
        <h1
          className="font-bold mb-4"
          style={{
            color: styles.titleColor,
            fontSize: `${styles.titleFontSize}px`,
            lineHeight: `${styles.titleFontSize * 1.2}px`,
          }}
        >
          {parseTitle(data.title, styles.highlightColor, styles.titleColor)}
        </h1>
        <p
          className="mb-4"
          style={{
            color: styles.descriptionColor,
            fontSize: `${styles.descriptionFontSize}px`,
            lineHeight: `${styles.descriptionFontSize * 1.5}px`,
          }}
          dangerouslySetInnerHTML={{ __html: data.content }}
        />
        <div className="flex flex-col items-center text-sm">
          <p style={{ color: styles.dateColor }} className="mb-2">
            {data.date}
          </p>
          <div className="flex items-center">
            {data.userImage && (
              <img
                src={data.userImage || "/placeholder.svg"}
                alt="User"
                className="w-8 h-8 rounded-full mr-2 object-cover"
              />
            )}
            <p style={{ color: styles.userColor }}>{data.userName}</p>
          </div>
        </div>
      </div>
      {data.watermark && (
        <img
          src={data.watermark || "/placeholder.svg"}
          alt="Watermark"
          className="absolute bottom-4 right-4 w-24 h-auto opacity-70 z-20"
        />
      )}
    </div>
  )
}
