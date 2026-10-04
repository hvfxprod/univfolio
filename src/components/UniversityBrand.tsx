/** Official portal PNG, displaying its symbol without the white wordmark. */
export function UniversityBrand() {
  return (
    <span className="inline-flex items-center gap-2.5 text-[#1D1D1F]">
      <span className="relative block w-[34px] h-9 shrink-0 overflow-hidden">
        <img src="/brand/seoul-institute-of-the-arts.png" alt="서울예술대학교 공식 로고" width="195" height="46" className="absolute left-0 top-0 h-9 w-auto max-w-none" />
      </span>
      <span className="text-[11px] sm:text-sm font-semibold leading-tight">
        Seoul Institute<br className="sm:hidden" /> of the Arts
      </span>
    </span>
  );
}

