import { SiInstagram, SiYoutube } from "@icons-pack/react-simple-icons";
import {
  ArrowRight,
  Calendar,
  CheckCircle2,
  ClipboardList,
  MessageSquare,
  Sparkles,
  Users,
} from "lucide-react";
import { Link } from "react-router";

import { Button } from "@/components/ui/button";
import { useLogout, useSession } from "@/hooks/use-auth";

export function meta() {
  return [
    { title: "Flocky" },
    { name: "description", content: "Flocky와 함께 교회와 소그룹 관리를 쉽게 하세요." },
  ];
}

function Navbar() {
  const { data: session } = useSession();
  const { mutateAsync: logout } = useLogout();

  const handleLogout = async () => {
    await logout();
  };

  return (
    <nav className="border-border bg-background/95 supports-backdrop-filter:bg-background/60 sticky top-0 z-50 border-b backdrop-blur">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link to="/" className="flex items-center gap-2">
          <span className="text-foreground text-xl font-bold tracking-tight">Flocky</span>
        </Link>
        <div className="flex items-center gap-4">
          {session ? (
            <button
              type="button"
              onClick={handleLogout}
              className="text-muted-foreground hover:text-foreground hidden text-sm font-medium transition-colors sm:block"
            >
              로그아웃
            </button>
          ) : (
            <Link
              to="/auth/login"
              className="text-muted-foreground hover:text-foreground hidden text-sm font-medium transition-colors sm:block"
            >
              로그인
            </Link>
          )}
          <Button asChild>
            <Link to="/app/dashboard">
              시작하기
              <ArrowRight className="size-4" />
            </Link>
          </Button>
        </div>
      </div>
    </nav>
  );
}

function Footer() {
  const socialLinks = [
    { icon: SiInstagram, label: "Instagram", href: "https://www.instagram.com/hanouri.mahanaim/" },
    { icon: SiYoutube, label: "YouTube", href: "https://www.youtube.com/@mahanaimnz" },
  ];

  const footerLinks = [
    {
      title: "지원",
      links: ["문의 접수", "가이드", "FAQ"],
    },
    {
      title: "소개",
      links: ["마하나임 개발팀", "블로그"],
    },
    {
      title: "법적 고지",
      links: ["이용약관", "개인정보처리방침", "라이선스"],
    },
  ];

  return (
    <footer className="border-border bg-muted/30 border-t">
      <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-5">
          <div className="space-y-4 lg:col-span-2">
            <div className="flex items-center gap-2">
              <div className="bg-primary text-primary-foreground flex size-8 items-center justify-center rounded-lg">
                <Sparkles className="size-4" />
              </div>
              <span className="text-foreground text-lg font-bold">Flocky</span>
            </div>
            <p className="text-muted-foreground max-w-xs text-sm leading-relaxed">
              교회와 소그룹 관리를 위한 올인원 플랫폼입니다. 예배, 출석, 소통을 한곳에서 관리하세요.
            </p>
            <div className="flex gap-2">
              {socialLinks.map(({ icon: Icon, label, href }) => (
                <a
                  key={label}
                  href={href}
                  className="border-border bg-background text-muted-foreground hover:bg-accent hover:text-accent-foreground flex size-9 items-center justify-center rounded-lg border transition-colors"
                  aria-label={label}
                >
                  <Icon className="size-4" aria-hidden />
                </a>
              ))}
            </div>
          </div>
          {footerLinks.map(({ title, links }) => (
            <div key={title}>
              <h3 className="text-foreground text-sm font-semibold">{title}</h3>
              <ul className="mt-4 space-y-3">
                {links.map((link) => (
                  <li key={link}>
                    <a
                      href="#"
                      className="text-muted-foreground hover:text-foreground text-sm transition-colors"
                    >
                      {link}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="border-border text-muted-foreground mt-12 border-t pt-8 text-center text-sm">
          © 2026 Flocky, Inc. All rights reserved.
        </div>
      </div>
    </footer>
  );
}

const features = [
  {
    icon: ClipboardList,
    title: "출석 관리",
    description:
      "예배와 모임별 출석을 기록하고 통계로 확인하세요. 주간·월간 리포트로 흐름을 파악할 수 있습니다.",
    color: "bg-chart-1/15 text-chart-4",
  },
  {
    icon: Users,
    title: "소그룹·목장 관리",
    description:
      "목장·소그룹 단위로 멤버를 구성하고, 리더 권한을 나눠 체계적으로 운영할 수 있습니다.",
    color: "bg-chart-2/15 text-chart-4",
  },
  {
    icon: Calendar,
    title: "일정 & 캘린더",
    description: "행사, 예배, 모임 일정을 팀과 공유하고 캘린더로 한눈에 관리하세요.",
    color: "bg-chart-3/15 text-chart-5",
  },
  {
    icon: MessageSquare,
    title: "공지 & 소통",
    description: "공지사항과 연락을 한곳에서 전달하고, 필요한 멤버만 골라 연락할 수 있습니다.",
    color: "bg-chart-4/15 text-chart-5",
  },
];

const benefits = ["무료로 시작하기", "설치 없이 바로 사용", "모바일 최적화", "안전한 데이터 보호"];

export default function Home() {
  return (
    <div className="bg-background min-h-screen">
      <Navbar />

      <main>
        {/* Hero */}
        <section className="relative overflow-hidden">
          {/* Background decorations */}
          <div className="absolute inset-0 -z-10">
            <div className="bg-chart-1/10 absolute top-0 left-1/4 size-96 -translate-x-1/2 rounded-full blur-3xl" />
            <div className="bg-chart-3/10 absolute top-1/4 right-1/4 size-96 translate-x-1/2 rounded-full blur-3xl" />
          </div>

          <div className="mx-auto max-w-6xl px-4 py-20 sm:px-6 sm:py-28 lg:px-8 lg:py-32">
            <div className="mx-auto max-w-3xl text-center">
              <div className="border-border bg-muted/50 text-muted-foreground mb-6 inline-flex items-center gap-2 rounded-full border px-4 py-1.5 text-sm">
                <Sparkles className="text-primary size-4" />
                <span>교회 관리의 새로운 시작</span>
              </div>

              <h1 className="text-foreground text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl">
                교회 관리를
                <span className="text-primary relative z-10 mx-2">간소화</span>
                하세요
              </h1>

              <p className="text-muted-foreground mx-auto mt-6 max-w-xl text-lg leading-relaxed text-balance">
                예배, 출석, 소그룹 관리를 한곳에서. Flocky로 교회 사역을 더 쉽고 체계적으로
                이끌어보세요.
              </p>

              <div className="mt-10 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
                <Button asChild size="lg" className="h-12 px-8 text-base">
                  <Link to="/app/dashboard">
                    무료로 시작하기
                    <ArrowRight className="size-4" />
                  </Link>
                </Button>
                <Link
                  to="#features"
                  className="text-muted-foreground hover:text-foreground inline-flex items-center gap-1 text-base font-medium transition-colors"
                >
                  기능 살펴보기
                  <ArrowRight className="size-4" />
                </Link>
              </div>

              {/* Benefits */}
              <div className="mt-12 flex flex-wrap items-center justify-center gap-x-6 gap-y-2">
                {benefits.map((benefit) => (
                  <div
                    key={benefit}
                    className="text-muted-foreground flex items-center gap-2 text-sm"
                  >
                    <CheckCircle2 className="text-primary size-4" />
                    <span>{benefit}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Trusted */}
        <section className="border-border bg-muted/30 border-y py-12">
          <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col items-center justify-center gap-6 sm:flex-row sm:gap-12">
              <p className="text-muted-foreground text-sm font-medium">
                신뢰할 수 있는 교회들이 사용 중
              </p>
              <div className="flex items-center gap-8">
                <div className="text-center">
                  <p className="text-foreground font-serif text-lg font-semibold">한우리교회</p>
                  <p className="text-muted-foreground text-xs">HANOURI CHURCH</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Features */}
        <section id="features" className="py-20 sm:py-28">
          <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-2xl text-center">
              <h2 className="text-foreground text-3xl font-bold tracking-tight sm:text-4xl">
                필요한 모든 기능을 한곳에서
              </h2>
              <p className="text-muted-foreground mt-4 text-lg">
                출석, 일정, 소그룹, 연락까지 교회 운영에 필요한 기능을 하나의 플랫폼에서 이용하세요.
              </p>
            </div>

            {/* Features Grid */}
            <div className="mt-16 grid gap-4 sm:grid-cols-2">
              {features.map(({ icon: Icon, title, description, color }, index) => (
                <div
                  key={title}
                  className="group border-border bg-card hover:border-primary/20 relative overflow-hidden rounded-2xl border p-6 transition-all hover:shadow-lg sm:p-8"
                >
                  <div
                    className={`inline-flex size-12 items-center justify-center rounded-xl ${color}`}
                  >
                    <Icon className="size-6" />
                  </div>
                  <h3 className="text-foreground mt-4 text-xl font-semibold">{title}</h3>
                  <p className="text-muted-foreground mt-2 leading-relaxed">{description}</p>

                  {/* Decorative gradient */}
                  <div
                    className="absolute -top-20 -right-20 size-40 rounded-full opacity-0 blur-3xl transition-opacity group-hover:opacity-100"
                    style={{
                      background: `linear-gradient(135deg, var(--chart-${index + 1}) 0%, transparent 70%)`,
                    }}
                  />
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* How it works */}
        <section className="border-border bg-muted/20 border-y py-20 sm:py-28">
          <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-2xl text-center">
              <h2 className="text-foreground text-3xl font-bold tracking-tight sm:text-4xl">
                간단한 3단계로 시작하세요
              </h2>
              <p className="text-muted-foreground mt-4 text-lg">
                복잡한 설정 없이 바로 시작할 수 있습니다.
              </p>
            </div>

            <div className="mt-16 grid gap-8 sm:grid-cols-3">
              {[
                { step: "01", title: "회원가입", desc: "이메일로 간편하게 가입하세요" },
                { step: "02", title: "교회 등록", desc: "교회 정보를 입력하고 설정하세요" },
                { step: "03", title: "관리 시작", desc: "멤버를 초대하고 관리를 시작하세요" },
              ].map(({ step, title, desc }, index) => (
                <div key={step} className="relative text-center">
                  {index < 2 && (
                    <div className="bg-border absolute top-8 left-1/2 hidden h-px w-full sm:block" />
                  )}
                  <div className="border-primary bg-background text-primary relative mx-auto flex size-16 items-center justify-center rounded-full border-2 text-xl font-bold">
                    {step}
                  </div>
                  <h3 className="text-foreground mt-4 text-lg font-semibold">{title}</h3>
                  <p className="text-muted-foreground mt-2 text-sm">{desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-20 sm:py-28">
          <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
            <div className="bg-primary relative overflow-hidden rounded-3xl px-6 py-16 text-center sm:px-12 sm:py-20">
              {/* Background pattern */}
              <div className="absolute inset-0 opacity-10">
                <div className="absolute -top-20 -left-20 size-80 rounded-full bg-white blur-3xl" />
                <div className="absolute -right-20 -bottom-20 size-80 rounded-full bg-white blur-3xl" />
              </div>

              <div className="relative">
                <h2 className="text-primary-foreground text-3xl font-bold tracking-tight sm:text-4xl">
                  지금 바로 시작하세요
                </h2>
                <p className="text-primary-foreground/80 mx-auto mt-4 max-w-xl text-lg">
                  Flocky와 함께하면 출석 관리, 일정 공유, 소통이 한곳에서 이루어집니다.
                </p>
                <div className="mt-8 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
                  <Button asChild size="lg" variant="secondary" className="h-12 px-8 text-base">
                    <Link to="/app/dashboard">
                      무료로 시작하기
                      <ArrowRight className="size-4" />
                    </Link>
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
