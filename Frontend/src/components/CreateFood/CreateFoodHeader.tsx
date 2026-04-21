

export default function CreateFoodHeader() {  const heading = "text-neutral-900";
  const subtext = "text-neutral-500";

  return (
    <section className="flex flex-col gap-2 pt-2">
      <h1 className={`text-3xl md:text-4xl font-extrabold tracking-tight ${heading}`}>
        Customize Food
      </h1>
      <p className={`text-lg font-medium ${subtext}`}>
        Create custom foods and map voice aliases to them.
      </p>
    </section>
  );
}
