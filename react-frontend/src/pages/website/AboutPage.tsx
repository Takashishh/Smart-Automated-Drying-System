import React from 'react';
import { motion } from 'framer-motion';
import { Shield, Zap, Lock, Wifi, Droplets, Thermometer, CloudRain, Scale, Fan, Wind, Smartphone } from 'lucide-react';
export function AboutPage() {
  return <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="bg-gradient-to-b from-blue-50 to-white py-20">
        <div className="max-w-7xl mx-auto px-6">
          <motion.div initial={{
          opacity: 0,
          y: 20
        }} animate={{
          opacity: 1,
          y: 0
        }} transition={{
          duration: 0.6
        }} className="text-center max-w-3xl mx-auto">
            <h1 className="text-5xl font-bold text-gray-900 mb-6">
              About the System
            </h1>
            <p className="text-xl text-gray-600 leading-relaxed">
              Discover how our intelligent laundry drying system combines
              advanced sensors, predictive AI, and automated controls to protect
              your clothes from unexpected weather.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Purpose Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <motion.div initial={{
            opacity: 0,
            x: -20
          }} whileInView={{
            opacity: 1,
            x: 0
          }} viewport={{
            once: true
          }} transition={{
            duration: 0.6
          }}>
              <h2 className="text-3xl font-bold text-gray-900 mb-6">
                Why We Created This System
              </h2>
              <p className="text-gray-600 mb-4 leading-relaxed">
                We've all experienced the frustration of sudden rain ruining
                freshly washed clothes. Traditional drying methods require
                constant monitoring and manual intervention, wasting time and
                energy.
              </p>
              <p className="text-gray-600 mb-4 leading-relaxed">
                Our Smart Automated Laundry Drying System solves this universal
                problem by combining weather monitoring, and
                automated controls to provide complete peace of mind.
              </p>
              <p className="text-gray-600 leading-relaxed">
                Whether you're at work, sleeping, or simply busy with life, our
                system ensures your clothes stay dry and
                protected—automatically.
              </p>
            </motion.div>

            <motion.div initial={{
            opacity: 0,
            x: 20
          }} whileInView={{
            opacity: 1,
            x: 0
          }} viewport={{
            once: true
          }} transition={{
            duration: 0.6
          }} className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl p-8 text-white">
              <h3 className="text-2xl font-bold mb-6">The Problem We Solve</h3>
              <ul className="space-y-4">
                <li className="flex items-start gap-3">
                  <CloudRain className="w-6 h-6 mt-1 flex-shrink-0" />
                  <span>
                    Unexpected rain damaging clothes left outside to dry
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <Zap className="w-6 h-6 mt-1 flex-shrink-0" />
                  <span>
                    Energy waste from over-drying or inefficient heating
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <Smartphone className="w-6 h-6 mt-1 flex-shrink-0" />
                  <span>
                    Constant manual monitoring and intervention required
                  </span>
                </li>
              </ul>
            </motion.div>
          </div>
        </div>
      </section>

      {/* System Overview */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-6">
          <motion.div initial={{
          opacity: 0,
          y: 20
        }} whileInView={{
          opacity: 1,
          y: 0
        }} viewport={{
          once: true
        }} transition={{
          duration: 0.6
        }} className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              System Overview
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              A comprehensive solution combining multiple sensors, intelligent
              actuators, and smart decision-making algorithms.
            </p>
          </motion.div>

          {/* Sensors */}
          <div className="mb-16">
            <h3 className="text-2xl font-bold text-gray-900 mb-8 text-center">
              Smart Sensors
            </h3>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[{
              icon: Droplets,
              title: 'Humidity Sensor',
              desc: 'Monitors moisture levels in clothes and air to optimize drying time'
            }, {
              icon: Thermometer,
              title: 'Temperature Sensor',
              desc: 'Tracks ambient temperature for efficient heating control'
            }, {
              icon: CloudRain,
              title: 'Rain Sensor',
              desc: 'Detects rainfall instantly to trigger automatic protection'
            }, ].map((sensor, index) => <motion.div key={sensor.title} initial={{
              opacity: 0,
              y: 20
            }} whileInView={{
              opacity: 1,
              y: 0
            }} viewport={{
              once: true
            }} transition={{
              duration: 0.6,
              delay: index * 0.1
            }} className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow">
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                    <sensor.icon className="w-6 h-6 text-blue-600" />
                  </div>
                  <h4 className="font-semibold text-gray-900 mb-2">
                    {sensor.title}
                  </h4>
                  <p className="text-sm text-gray-600">{sensor.desc}</p>
                </motion.div>)}
            </div>
          </div>

          {/* Actuators */}
          <div className="mb-16">
            <h3 className="text-2xl font-bold text-gray-900 mb-8 text-center">
              Intelligent Actuators
            </h3>
            <div className="grid md:grid-cols-3 gap-6">
              {[{
              icon: Zap,
              title: 'Retractable Rod',
              desc: 'Automatically extends and retracts to protect clothes from rain'
            }, {
              icon: Fan,
              title: 'Drying Fan',
              desc: 'Variable-speed fan accelerates drying when needed'
            }, {
              icon: Wind,
              title: 'Smart Heater',
              desc: 'Energy-efficient heating for faster drying in humid conditions'
            }].map((actuator, index) => <motion.div key={actuator.title} initial={{
              opacity: 0,
              y: 20
            }} whileInView={{
              opacity: 1,
              y: 0
            }} viewport={{
              once: true
            }} transition={{
              duration: 0.6,
              delay: index * 0.1
            }} className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow">
                  <div className="w-12 h-12 bg-emerald-100 rounded-lg flex items-center justify-center mb-4">
                    <actuator.icon className="w-6 h-6 text-emerald-600" />
                  </div>
                  <h4 className="font-semibold text-gray-900 mb-2">
                    {actuator.title}
                  </h4>
                  <p className="text-sm text-gray-600">{actuator.desc}</p>
                </motion.div>)}
            </div>
          </div>

          {/* Decision Logic */}
          <motion.div initial={{
          opacity: 0,
          y: 20
        }} whileInView={{
          opacity: 1,
          y: 0
        }} viewport={{
          once: true
        }} transition={{
          duration: 0.6
        }} className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl p-8 text-white">
            <h3 className="text-2xl font-bold mb-4">
              Intelligent Decision Logic
            </h3>
            <p className="text-blue-100 mb-6">
              Our system uses advanced algorithms to analyze sensor data in
              real-time, predict weather patterns, and make intelligent
              decisions about when to retract, when to activate fans or heating,
              and when drying is complete.
            </p>
            <div className="grid md:grid-cols-3 gap-4">
              <div className="bg-white/10 rounded-lg p-4">
                <p className="font-semibold mb-1">Weather Prediction</p>
                <p className="text-sm text-blue-100">
                  AI-powered rain forecasting
                </p>
              </div>
              <div className="bg-white/10 rounded-lg p-4">
                <p className="font-semibold mb-1">Drying Optimization</p>
                <p className="text-sm text-blue-100">
                  Energy-efficient control
                </p>
              </div>
              <div className="bg-white/10 rounded-lg p-4">
                <p className="font-semibold mb-1">Safety Monitoring</p>
                <p className="text-sm text-blue-100">
                  Continuous system checks
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Safety & Reliability */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-6">
          <motion.div initial={{
          opacity: 0,
          y: 20
        }} whileInView={{
          opacity: 1,
          y: 0
        }} viewport={{
          once: true
        }} transition={{
          duration: 0.6
        }} className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Safety & Reliability
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Built with multiple safety features to protect your clothes and
              ensure reliable operation.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[{
            icon: Shield,
            title: 'Load Protection',
            desc: 'Maximum load: 10kg. System alerts if weight limit is exceeded to prevent damage.'
          }, {
            icon: Zap,
            title: 'Obstruction Detection',
            desc: 'Sensors detect obstacles during rod movement and stop immediately to prevent accidents.'
          }, {
            icon: Lock,
            title: 'Automatic Shutoff',
            desc: 'System automatically powers down in case of malfunction or emergency situations.'
          }, {
            icon: Wifi,
            title: 'Secure Pairing',
            desc: 'Encrypted Bluetooth connection ensures only authorized devices can control the system.'
          }].map((feature, index) => <motion.div key={feature.title} initial={{
            opacity: 0,
            y: 20
          }} whileInView={{
            opacity: 1,
            y: 0
          }} viewport={{
            once: true
          }} transition={{
            duration: 0.6,
            delay: index * 0.1
          }} className="bg-white rounded-xl p-6 border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
                <div className="w-12 h-12 bg-emerald-100 rounded-lg flex items-center justify-center mb-4">
                  <feature.icon className="w-6 h-6 text-emerald-600" />
                </div>
                <h4 className="font-semibold text-gray-900 mb-2">
                  {feature.title}
                </h4>
                <p className="text-sm text-gray-600">{feature.desc}</p>
              </motion.div>)}
          </div>
        </div>
      </section>
    </div>;
}