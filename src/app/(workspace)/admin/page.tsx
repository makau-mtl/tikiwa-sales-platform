export default function AdminHomePage() {
  return (
    <section aria-labelledby="workspace-heading">
      <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#a15b35]">
        Tikiwa Lands
      </p>
      <h1
        id="workspace-heading"
        className="mt-3 text-3xl font-semibold tracking-tight text-[#202820] sm:text-4xl"
      >
        Staff workspace
      </h1>
      <p className="mt-3 max-w-xl text-sm leading-6 text-[#687269]">
        Your secure workspace is ready. Sales tools will appear here as they become available.
      </p>
      <div className="mt-10 border-y border-[#dfe2da] py-5">
        <p className="text-sm font-medium text-[#303a32]">Workspace access confirmed</p>
        <p className="mt-1 text-sm text-[#788078]">
          Your account is connected to the Tikiwa staff profile system.
        </p>
      </div>
    </section>
  );
}