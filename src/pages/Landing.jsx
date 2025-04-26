// Landing.jsx (Corrected)
import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Carousel, CarouselContent, CarouselItem } from '@/components/ui/carousel';
import Autoplay from 'embla-carousel-autoplay'; // ✅ Keep only this one
import './Landing.css';
import companies from './../data/companies.json';
import faqs from './../data/faqs.json'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';

const Landing = () => {
  return (
    <main className="landing-main">
      <section className="landing-section">
        <h1 className="landing-title">
          Find Your Dream Job
          <span className="landing-sub">
            and get
            <img
              src="/logo.png"
              className="landing-logo"
              alt="Hirrd Logo"
            />
          </span>
        </h1>
        <p className="landing-description">
          Explore thousands of job listings or find the perfect candidate
        </p>
      </section>

      <div className="landing-actions">
  <Link to="/onboarding?role=candidate">
    <Button className="custom-button blue">Find Jobs</Button>
  </Link>
  <Link to="/onboarding?role=recruiter">
    <Button className="custom-button red">Post a Job</Button>
  </Link>
</div>


      <Carousel 
        plugins={[Autoplay({ delay: 1000 })]}
        className="landing-carousel"
      >
          <CarouselContent className= "flex gap-5 sm:gap-20 items-center">
         {companies.map(({name , id , path})=>{
            return(
                <CarouselItem key = {id} className= "basis-1/3 lg:basis-1/6">
                    <img src = {path} alt = {name}
                    className='h-9 sm:h-14 object-contain'
                    />
                </CarouselItem>
            )
         })}
      </CarouselContent>
    {/* </Carousel> */}
  

        {/* Carousel items go here */}
      </Carousel>

      <img src="/banner.jpeg" alt="" className='w-full' />
      <section className='grid grid-cols-1 md:grid-cols-2 gap-4'>
      <Card>
  <CardHeader>
    <CardTitle>For Job Seekers</CardTitle>
  </CardHeader>
  <CardContent>
    Search and apply for jobs , track applications  , and more.
  </CardContent>
</Card>
<Card>
  <CardHeader>
    <CardTitle>For Employers</CardTitle>
  </CardHeader>
  <CardContent>
  Post jobs, manage applications, and find the best candidates.  </CardContent>
</Card>

      </section>

      <Accordion type="multiple" className="w-full divide-y divide-white/20">
  {faqs.map((faq, index) => (
    <AccordionItem
      key={index}
      value={`item-${index + 1}`}
      className="py-4"
    >
      <AccordionTrigger className="text-lg sm:text-lg font-semibold text-white hover:underline transition-all">
        {faq.question}
      </AccordionTrigger>
      <AccordionContent className="mt-1 pl-2 text-base text-muted-foreground leading-relaxed">
        {faq.answer}
      </AccordionContent>
    </AccordionItem>
  ))}
</Accordion>


    </main>
  );
};

export default Landing;
