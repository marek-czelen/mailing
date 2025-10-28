<template>
  <Html>
    <Head />
    <Preview>{{ previewText }}</Preview>
    <Body style="background-color: #f4f4f4; font-family: Georgia, serif;">
      <Container style="background-color: #ffffff; margin: 40px auto; max-width: 600px;">
        
        <!-- Header -->
        <Section style="background-color: #2c3e50; padding: 20px; text-align: center;">
          <Heading style="color: #ffffff; font-size: 24px; margin: 0;">{{ companyName }}</Heading>
        </Section>

        <!-- Main Content -->
        <Section style="padding: 40px;">
          <Heading style="color: #2c3e50; font-size: 28px; margin: 0 0 20px; text-align: center;">
            {{ title }}
          </Heading>
          
          <Text style="color: #34495e; font-size: 16px; line-height: 1.6; margin: 0 0 20px;">
            Drogi {{ recipientName }},
          </Text>
          
          <Text style="color: #34495e; font-size: 16px; line-height: 1.6; margin: 0 0 30px;">
            {{ content }}
          </Text>

          <!-- Quote or highlight -->
          <div style="border-left: 4px solid #3498db; background-color: #ecf0f1; padding: 20px; margin: 30px 0;">
            <Text style="color: #2c3e50; font-size: 18px; font-style: italic; margin: 0;">
              "{{ quote }}"
            </Text>
          </div>

          <!-- CTA -->
          <div style="text-align: center; margin: 40px 0;">
            <Button 
              :href="ctaUrl"
              style="background-color: #3498db; color: white; padding: 15px 30px; border-radius: 5px; text-decoration: none; font-weight: bold; font-size: 16px; display: inline-block;"
            >
              {{ ctaText }}
            </Button>
          </div>

          <Text style="color: #34495e; font-size: 16px; line-height: 1.6; margin: 30px 0 0;">
            Z poważaniem,<br>
            {{ senderName }}<br>
            {{ senderTitle }}
          </Text>
        </Section>

        <!-- Footer -->
        <Section style="background-color: #ecf0f1; padding: 20px; text-align: center;">
          <Text style="color: #7f8c8d; font-size: 12px; line-height: 1.4; margin: 0;">
            {{ footerText }}
          </Text>
        </Section>
      </Container>
    </Body>
  </Html>
</template>

<script>
import { 
  Html, 
  Head, 
  Preview, 
  Body, 
  Container, 
  Section, 
  Heading, 
  Text, 
  Button 
} from '@vue-email/components';

export default {
  name: 'NewsletterTemplate',
  components: {
    Html, Head, Preview, Body, Container, Section, Heading, Text, Button
  },
  props: {
    previewText: { type: String, default: '' },
    companyName: { type: String, default: 'Newsletter' },
    title: { type: String, default: 'Najnowsze wiadomości' },
    recipientName: { type: String, default: 'Czytelniku' },
    content: { type: String, default: '' },
    quote: { type: String, default: 'Ważna informacja dla Ciebie' },
    ctaText: { type: String, default: 'Czytaj więcej' },
    ctaUrl: { type: String, default: '#' },
    senderName: { type: String, default: 'Redakcja' },
    senderTitle: { type: String, default: 'Newsletter' },
    footerText: { type: String, default: '' }
  }
};
</script>