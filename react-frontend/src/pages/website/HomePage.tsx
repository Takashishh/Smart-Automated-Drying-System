import React from 'react';
import { motion } from 'framer-motion';
import { CloudRain, Wind, Shield, Zap, Smartphone, ArrowRight, CheckCircle2 } from 'lucide-react';
import { FeatureCard } from '../../components/website/FeatureCard';
interface HomePageProps {
  onNavigate: (page: string) => void;
}
export function HomePage({
  onNavigate
}: HomePageProps) {
  return <div className="overflow-hidden">
      {/* Hero Section */}
      <section className="relative pt-32 pb-20 lg:pt-48 lg:pb-32 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-blue-50 to-white -z-10" />
        <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-blue-100/50 to-transparent -z-10 rounded-bl-[100px]" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <motion.div initial={{
            opacity: 0,
            x: -20
          }} animate={{
            opacity: 1,
            x: 0
          }} transition={{
            duration: 0.6
          }}>
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-100 text-blue-700 rounded-full text-sm font-medium mb-6">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
                </span>
                Smart Rack System V2.0
              </div>
              <h1 className="text-5xl lg:text-6xl font-bold text-gray-900 leading-tight mb-6">
                Smart Rack. <br />
                <span className="text-blue-600">Rain-Safe.</span>
              </h1>
              <p className="text-xl text-gray-600 mb-8 leading-relaxed max-w-lg">
                The intelligent automated Rack system that protects your
                clothes from rain and dries them efficiently using smart
                sensors.
              </p>
              <div className="flex flex-wrap gap-4">
                <button onClick={() => document.getElementById('how-it-works')?.scrollIntoView({
                behavior: 'smooth'
              })} className="px-8 py-4 bg-blue-600 text-white rounded-full font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-200 flex items-center gap-2">
                  How It Works <ArrowRight size={18} />
                </button>
                <button onClick={() => onNavigate('manuals')} className="px-8 py-4 bg-white text-gray-700 border border-gray-200 rounded-full font-bold hover:bg-gray-50 transition-all">
                  View Manuals
                </button>
              </div>
            </motion.div>

            <motion.div initial={{
            opacity: 0,
            scale: 0.9
          }} animate={{
            opacity: 1,
            scale: 1
          }} transition={{
            duration: 0.6,
            delay: 0.2
          }} className="relative">
              <div className="relative z-10 bg-white rounded-3xl shadow-2xl p-4 border border-gray-100">
                <img src="https://images.unsplash.com/photo-1517677208171-0bc6725a3e60?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80" alt="Smart Laundry System" className="rounded-2xl w-full h-auto object-cover aspect-[4/3]" />

                {/* Floating Cards */}
                <motion.div animate={{
                y: [0, -10, 0]
              }} transition={{
                repeat: Infinity,
                duration: 4,
                ease: 'easeInOut'
              }} className="absolute -bottom-6 -left-6 bg-white p-4 rounded-2xl shadow-xl border border-gray-50 flex items-center gap-3">
                  <div className="p-2 bg-green-100 rounded-full text-green-600">
                    <Shield size={20} />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Status</p>
                    <p className="text-sm font-bold text-gray-900">Protected</p>
                  </div>
                </motion.div>

                <motion.div animate={{
                y: [0, 10, 0]
              }} transition={{
                repeat: Infinity,
                duration: 5,
                ease: 'easeInOut',
                delay: 1
              }} className="absolute -top-6 -right-6 bg-white p-4 rounded-2xl shadow-xl border border-gray-50 flex items-center gap-3">
                  <div className="p-2 bg-blue-100 rounded-full text-blue-600">
                    <CloudRain size={20} />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Rain Sensor</p>
                    <p className="text-sm font-bold text-gray-900">Active</p>
                  </div>
                </motion.div>
              </div>

              {/* Decorative blobs */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] bg-blue-200/20 blur-3xl rounded-full -z-10" />
            </motion.div>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Why Choose Smart Laundry?
            </h2>
            <p className="text-lg text-gray-500">
              Advanced technology designed to make your laundry routine
              effortless and worry-free.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <FeatureCard icon={<CloudRain size={24} />} title="Auto Rain Detection" description="Instantly detects rain drops and automatically retracts the drying rod to keep clothes dry." delay={0.1} />
            <FeatureCard icon={<Zap size={24} />} title="Smart Drying" description="Intelligent sensors monitor humidity and temperature to optimize drying time and energy usage." delay={0.2} />
            <FeatureCard icon={<Wind size={24} />} title="Energy Efficient" description="Smart fan and heater control ensures minimal power consumption while maximizing drying speed." delay={0.3} />
            <FeatureCard icon={<Shield size={24} />} title="Safety First" description="Built-in obstruction detection and load limit protection guarantees safe operation." delay={0.4} />
            <FeatureCard icon={<Smartphone size={24} />} title="Real-time Monitoring" description="Stay connected with our mobile app to monitor status and control the system remotely." delay={0.5} />
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="py-24 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              How It Works
            </h2>
            <p className="text-lg text-gray-500">
              A seamless automated process from start to finish.
            </p>
          </div>

          <div className="relative">
            {/* Connecting Line */}
            <div className="hidden lg:block absolute top-1/2 left-0 w-full h-0.5 bg-gray-200 -translate-y-1/2 z-0" />

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 relative z-10">
              {[{
              title: 'Monitor',
              desc: 'Sensors track weather & clothes status'
            }, {
              title: 'Predict',
              desc: 'System analyzes data to predict rain'
            }, {
              title: 'Protect',
              desc: 'Rod retracts automatically if rain detected'
            }, {
              title: 'Dry',
              desc: 'Fans & heaters activate to assist drying'
            }, {
              title: 'Notify',
              desc: 'You receive updates via the mobile app'
            }].map((step, index) => <motion.div key={index} initial={{
              opacity: 0,
              y: 20
            }} whileInView={{
              opacity: 1,
              y: 0
            }} viewport={{
              once: true
            }} transition={{
              delay: index * 0.1
            }} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 text-center">
                  <div className="w-10 h-10 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold text-lg mx-auto mb-4 shadow-lg shadow-blue-200">
                    {index + 1}
                  </div>
                  <h3 className="font-bold text-gray-900 mb-2">{step.title}</h3>
                  <p className="text-sm text-gray-500">{step.desc}</p>
                </motion.div>)}
            </div>
          </div>
        </div>
      </section>
    </div>;
}