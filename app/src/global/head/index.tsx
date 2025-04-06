import useApp from "@global/hooks/useApp";
import { Helmet } from "react-helmet-async";

type Props = {
  title: string;
  description: string;
  SEODisabled?: boolean;
  imageURL?: string;
};

const Head = ({ title, description, SEODisabled = false, imageURL }: Props) => {
  const appTitle = useApp((state) => state.appTitle);
  const keyWords = useApp((state) => state.keyWords);

  return (
    <>
      <Helmet>
        <title>
          {title} | {appTitle}
        </title>
        <meta name="description" content={description} />
      </Helmet>

      {/* Only add SEO meta tags if SEODisabled is false */}
      {!SEODisabled && (
        <SEOData
          title={title}
          description={description}
          keywords={keyWords}
          imageURL={imageURL}
        />
      )}
    </>
  );
};

type SEODataProps = {
  title: string;
  description: string;
  imageURL?: string; // Optional image for social sharing
  keywords?: string; // Optional list of keywords
};

const SEOData = ({
  title,
  description,
  imageURL = "default-image-url.jpg", // Default image if not provided
  keywords,
}: SEODataProps) => {
  const author = useApp((state) => state.author);
  return (
    <>
      {/* Basic Meta Tags */}
      <meta name="description" content={description} />
      <meta name="keywords" content={keywords} />
      <meta name="author" content={author} />
      <meta name="robots" content="index, follow" />

      {/* Open Graph Meta Tags (For Social Media) */}
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={imageURL} />
      <meta property="og:type" content="website" />
      <meta property="og:url" content={window.location.href} />

      {/* Twitter Card Meta Tags (For Twitter) */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={imageURL} />

      {/* Schema.org Structured Data (For Rich Results) */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebPage",
            name: title,
            description: description,
            url: window.location.href,
          }),
        }}
      />
    </>
  );
};

export default Head;
