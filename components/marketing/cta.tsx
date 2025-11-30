// Call-to-action component
interface CTAProps {
  title: string;
  description: string;
  buttonText: string;
  onButtonClick: () => void;
}

export default function CTA({ title, description, buttonText, onButtonClick }: CTAProps) {
  return (
    <section className="cta">
      <h2>{title}</h2>
      <p>{description}</p>
      <button onClick={onButtonClick}>{buttonText}</button>
    </section>
  );
}
