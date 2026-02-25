import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { db } from '@/lib/db';
import {
  Stethoscope,
  Heart,
  Sparkles,
  Shield,
  Clock,
  Award,
  MapPin,
  Phone,
  ChevronRight,
  Star
} from 'lucide-react';

// Fetch services dynamically
async function getServices() {
  try {
    return await db.product.findMany({
      where: { isActive: true },
      orderBy: { createdAt: 'asc' },
      take: 6,
    });
  } catch (error) {
    console.error('Error fetching services:', error);
    return [];
  }
}

export default async function HomePage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const services = await getServices();
  const params = await searchParams;
  const referralCode = typeof params.ref === 'string' ? params.ref : '';

  // Build signup URL with referral code
  const signupUrl = referralCode ? `/signup?ref=${referralCode}` : '/signup';
  const loginUrl = '/login';

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="bg-white border-b border-gray-100 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-[#008E7E] rounded-full flex items-center justify-center">
                <Sparkles className="w-4 h-4 text-white" />
              </div>
              <span className="text-xl font-bold">
                <span className="text-[#008E7E]">KSAA</span>
                <span className="text-[#F37321] text-sm ml-1">STEMCARE</span>
              </span>
            </div>
            <div className="flex items-center gap-4">
              <Link href={loginUrl} className="text-gray-600 hover:text-[#008E7E] transition-colors">
                Login
              </Link>
              <Button asChild className="bg-[#008E7E] hover:bg-[#0a4f47] text-white">
                <Link href={signupUrl}>Get Started</Link>
              </Button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-[#008E7E] via-[#0a4f47] to-[#083d38] text-white py-20 lg:py-32 overflow-hidden">
        {/* Decorative elements */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-[#F37321] opacity-10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-white opacity-5 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="text-center max-w-3xl mx-auto">
            {referralCode && (
              <Badge className="bg-[#F37321] text-white border-none mb-4 text-sm">
                🎁 Referral Code: {referralCode.toUpperCase()} Applied
              </Badge>
            )}
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 leading-tight">
              Regenerative Medicine & <span className="text-[#F37321]">Stem Cell Therapy</span>
            </h1>
            <p className="text-lg md:text-xl text-gray-200 mb-8 max-w-2xl mx-auto">
              Experience trusted biotech-driven regenerative therapy at KSAA Stemcare.
              Keeping Sickness Afar Away with science-focused, personalized treatments.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button asChild size="lg" className="bg-[#F37321] hover:bg-[#e06a1f] text-white px-8">
                <Link href={signupUrl}>
                  Book Free Consultation
                  <ChevronRight className="ml-2 w-4 h-4" />
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="bg-[#008E7E] border-white text-white hover:bg-white hover:text-[#008E7E]">
                <Link href="https://ksaastemcare.com" target="_blank">
                  Learn More
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Trust Badges */}
      <section className="py-8 bg-gray-50 border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-wrap justify-center items-center gap-8 md:gap-16 text-gray-500">
            <div className="flex items-center gap-2">
              <Shield className="w-5 h-5 text-[#008E7E]" />
              <span className="text-sm font-medium">Licensed Clinic</span>
            </div>
            <div className="flex items-center gap-2">
              <Award className="w-5 h-5 text-[#008E7E]" />
              <span className="text-sm font-medium">Expert Medical Team</span>
            </div>
            <div className="flex items-center gap-2">
              <MapPin className="w-5 h-5 text-[#008E7E]" />
              <span className="text-sm font-medium">Kuala Lumpur, Malaysia</span>
            </div>
            <div className="flex items-center gap-2">
              <Star className="w-5 h-5 text-[#F37321]" />
              <span className="text-sm font-medium">Trusted by 1000+ Patients</span>
            </div>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section className="py-16 lg:py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <Badge className="bg-[#008E7E]/10 text-[#008E7E] border-[#008E7E]/20 mb-4">
              Our Services
            </Badge>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Health Restoration <span className="text-[#F37321]">Treatments</span>
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Explore our range of regenerative medicine and wellness services designed to optimize your health.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {services.length > 0 ? (
              services.map((service: any) => (
                <Card key={service.id} className="border border-[#008E7E]/20 hover:border-[#008E7E]/50 hover:shadow-lg transition-all duration-300 group">
                  <CardHeader>
                    <div className="w-12 h-12 bg-[#008E7E]/10 rounded-lg flex items-center justify-center mb-4 group-hover:bg-[#008E7E] transition-colors">
                      <Stethoscope className="w-6 h-6 text-[#008E7E] group-hover:text-white transition-colors" />
                    </div>
                    <CardTitle className="text-lg text-gray-900">{service.name}</CardTitle>
                    <CardDescription className="line-clamp-2">
                      {service.description || 'Premium healthcare service'}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between">
                      {service.priceMYR > 0 ? (
                        <span className="text-[#008E7E] font-bold text-lg">
                          RM {service.priceMYR.toFixed(2)}
                        </span>
                      ) : (
                        <Badge className="bg-green-100 text-green-700 border-none">FREE</Badge>
                      )}
                      <Button asChild variant="ghost" size="sm" className="text-[#008E7E] hover:text-[#008E7E] hover:bg-[#008E7E]/10">
                        <Link href={signupUrl}>
                          Book Now <ChevronRight className="ml-1 w-4 h-4" />
                        </Link>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : (
              // Fallback static services when database is empty
              <>
                {[
                  { name: 'Free Consultation', desc: '30-minute free consultation via Google Meet or WhatsApp', price: 'FREE' },
                  { name: 'Mesenchymal Stem Cell', desc: 'Advanced stem cell therapy for regeneration', price: 'RM 15,000' },
                  { name: 'EECP Treatment', desc: 'Enhanced external counterpulsation therapy', price: 'RM 8,000' },
                  { name: 'NK Cell Treatment', desc: 'Natural killer cell immunotherapy', price: 'RM 12,000' },
                  { name: 'Wellness Booster', desc: 'IV vitamin and wellness infusions', price: 'RM 500' },
                  { name: 'Blood Screening', desc: 'Comprehensive health screening', price: 'RM 800' },
                ].map((service, idx) => (
                  <Card key={idx} className="border border-[#008E7E]/20 hover:border-[#008E7E]/50 hover:shadow-lg transition-all duration-300 group">
                    <CardHeader>
                      <div className="w-12 h-12 bg-[#008E7E]/10 rounded-lg flex items-center justify-center mb-4 group-hover:bg-[#008E7E] transition-colors">
                        <Stethoscope className="w-6 h-6 text-[#008E7E] group-hover:text-white transition-colors" />
                      </div>
                      <CardTitle className="text-lg text-gray-900">{service.name}</CardTitle>
                      <CardDescription>{service.desc}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center justify-between">
                        {service.price === 'FREE' ? (
                          <Badge className="bg-green-100 text-green-700 border-none">FREE</Badge>
                        ) : (
                          <span className="text-[#008E7E] font-bold text-lg">{service.price}</span>
                        )}
                        <Button asChild variant="ghost" size="sm" className="text-[#008E7E] hover:text-[#008E7E] hover:bg-[#008E7E]/10">
                          <Link href={signupUrl}>
                            Book Now <ChevronRight className="ml-1 w-4 h-4" />
                          </Link>
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </>
            )}
          </div>
        </div>
      </section>

      {/* Why Choose Us Section */}
      <section className="py-16 lg:py-24 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Why Choose <span className="text-[#008E7E]">KSAA Stemcare</span>?
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-[#008E7E] rounded-full flex items-center justify-center mx-auto mb-4">
                <Award className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Expert Team</h3>
              <p className="text-gray-600">
                Our experienced medical professionals provide personalized care with a focus on results.
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-[#F37321] rounded-full flex items-center justify-center mx-auto mb-4">
                <Heart className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Care Commitment</h3>
              <p className="text-gray-600">
                We are committed to being your trusted healthcare partner throughout your wellness journey.
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-[#008E7E] rounded-full flex items-center justify-center mx-auto mb-4">
                <Sparkles className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Modern Facilities</h3>
              <p className="text-gray-600">
                State-of-the-art equipment and facilities designed to promote health and healing.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 lg:py-20 bg-[#008E7E]">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Skip The Waiting Room!
          </h2>
          <p className="text-lg text-gray-200 mb-8">
            Register online before you arrive. Book your free consultation today.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild size="lg" className="bg-[#F37321] hover:bg-[#e06a1f] text-white px-8">
              <Link href={signupUrl}>
                Create Free Account
                <ChevronRight className="ml-2 w-4 h-4" />
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="bg-[#008E7E] border-white text-white hover:bg-white hover:text-[#008E7E]">
              <Link href={loginUrl}>
                I Have an Account
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8">
            <div className="col-span-2">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 bg-[#008E7E] rounded-full flex items-center justify-center">
                  <Sparkles className="w-4 h-4 text-white" />
                </div>
                <span className="text-xl font-bold text-white">
                  KSAA <span className="text-[#F37321] text-sm">STEMCARE</span>
                </span>
              </div>
              <p className="text-sm max-w-sm">
                Trusted regenerative therapy and biotech-driven stem cell treatment centre in Kuala Lumpur, Malaysia. Keeping Sickness Afar Away.
              </p>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">Quick Links</h4>
              <ul className="space-y-2 text-sm">
                <li><Link href="https://ksaastemcare.com" target="_blank" className="hover:text-white transition-colors">Main Website</Link></li>
                <li><Link href={signupUrl} className="hover:text-white transition-colors">Create Account</Link></li>
                <li><Link href={loginUrl} className="hover:text-white transition-colors">Patient Login</Link></li>
                <li><Link href="/admin-login" className="hover:text-white transition-colors">Staff Portal</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">Contact</h4>
              <ul className="space-y-2 text-sm">
                <li className="flex items-center gap-2">
                  <MapPin className="w-4 h-4" />
                  Kuala Lumpur, Malaysia
                </li>
                <li className="flex items-center gap-2">
                  <Phone className="w-4 h-4" />
                  <a href="https://wa.me/60123456789" className="hover:text-white transition-colors">WhatsApp</a>
                </li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-sm">
            <p>© {new Date().getFullYear()} KSAA Stemcare Malaysia. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
