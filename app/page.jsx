import HeroSection from "@/components/HomePage/HeroSection";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { featuresData, howItWorksData, statsData, testimonialsData } from "@/data/landing";
import Image from "next/image";
import Link from "next/link";

export default function Home() {
  return (
    <div className="mt-40">
      <HeroSection />

      <section className="py-20 bg-[var(--primaryColor-light)]">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {statsData?.map((stat) => (
              <div key={stat.label} className="text-center">
                <h2 className="text-4xl font-bold text-[var(--primaryColor)] mb-2">{stat.value}</h2>
                <p className="text-gray-600">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">Everything you need to manage your finances</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {featuresData?.map((feature) => (
              <Card key={feature.title} className="p-6">
                <CardContent className="space-y-4 pt-4 ">
                  {feature.icon}
                  <h3 className="text-xl font-semibold">{feature.title}</h3>
                  <p className="text-gray-600">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 bg-[var(--primaryColor-light)]">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">How It Works</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {howItWorksData?.map((step) => (
              <div key={step.title} className="p-6 text-center">
                <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-6">{step.icon}</div>
                <h3 className="text-xl font-semibold mb-4">{step.title}</h3>
                <p className="text-gray-600">{step.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">What Our Users Say</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonialsData?.map((testimonial) => (
              <Card key={testimonial.name} className="p-6">
                <CardContent className="pt-4">
                  <div className="flex items-center mb-4">
                    <Image src={testimonial.image} alt={testimonial.name} width={40} height={40} className="rounded-full" />
                    <div className="ml-4">
                      <h3 className="text-xl font-semibold">{testimonial.name}</h3>
                      <p className="text-sm text-gray-600">{testimonial.role}</p>
                    </div>
                  </div>
                  <p className="text-gray-600">{testimonial.quote}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 bg-[var(--primaryColor)] text-center">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-white mb-6">Ready to Take Control of Your Finances</h2>
          <p className="text-blue-100 mb-8 max-w-2xl mx-auto">
            Join thousands of users who are already managing their finances smartly with Finaura.
          </p>
          <Link href={'/dashboard'}>
            <Button size="lg" className="bg-white text-[var(--primaryColor)] hover:text-[var(--primaryColor)] hover:bg-[var(--primaryColor-light)] animate-bounce">Start Free Trial</Button>
          </Link>
        </div>
      </section>

    </div>
  );
}
