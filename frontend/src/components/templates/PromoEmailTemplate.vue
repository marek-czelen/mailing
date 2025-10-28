<template>
  <Html>
    <Head />
    <Preview>{{ previewText }}</Preview>
    <Body style="background-color: #f8f9fa; font-family: Arial, sans-serif;">
      <Container style="background-color: #ffffff; margin: 40px auto; max-width: 600px; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
        
        <!-- Hero Section -->
        <Section style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 60px 40px; text-align: center;">
          <Heading style="color: #ffffff; font-size: 32px; font-weight: bold; margin: 0 0 16px; text-shadow: 0 2px 4px rgba(0,0,0,0.2);">
            {{ heroTitle }}
          </Heading>
          <Text style="color: #e8f4f8; font-size: 18px; margin: 0; opacity: 0.9;">
            {{ heroSubtitle }}
          </Text>
        </Section>

        <!-- Content Section -->
        <Section style="padding: 40px;">
          <Row>
            <Column>
              <Text style="color: #333; font-size: 16px; line-height: 1.6; margin: 0 0 24px;">
                {{ contentText }}
              </Text>
              
              <!-- CTA Button -->
              <div style="text-align: center; margin: 32px 0;">
                <Button 
                  :href="buttonUrl"
                  style="background: linear-gradient(45deg, #667eea, #764ba2); color: white; padding: 16px 32px; border-radius: 25px; text-decoration: none; font-weight: bold; font-size: 16px; display: inline-block; box-shadow: 0 4px 15px rgba(102, 126, 234, 0.4);"
                >
                  {{ buttonText }}
                </Button>
              </div>
            </Column>
          </Row>
        </Section>

        <!-- Features Section -->
        <Section style="background-color: #f8f9fa; padding: 40px;">
          <Row>
            <Column style="width: 50%; padding: 0 20px;">
              <div style="text-align: center; padding: 20px;">
                <div style="width: 60px; height: 60px; background: linear-gradient(45deg, #667eea, #764ba2); border-radius: 50%; margin: 0 auto 16px; display: flex; align-items: center; justify-content: center;">
                  <Text style="color: white; font-size: 24px; margin: 0;">🚀</Text>
                </div>
                <Heading style="color: #333; font-size: 18px; margin: 0 0 8px;">Szybkość</Heading>
                <Text style="color: #666; font-size: 14px; margin: 0;">Błyskawiczne rezultaty</Text>
              </div>
            </Column>
            <Column style="width: 50%; padding: 0 20px;">
              <div style="text-align: center; padding: 20px;">
                <div style="width: 60px; height: 60px; background: linear-gradient(45deg, #667eea, #764ba2); border-radius: 50%; margin: 0 auto 16px; display: flex; align-items: center; justify-content: center;">
                  <Text style="color: white; font-size: 24px; margin: 0;">💎</Text>
                </div>
                <Heading style="color: #333; font-size: 18px; margin: 0 0 8px;">Jakość</Heading>
                <Text style="color: #666; font-size: 14px; margin: 0;">Najwyższa jakość usług</Text>
              </div>
            </Column>
          </Row>
        </Section>

        <!-- Footer -->
        <Section style="background-color: #333; padding: 30px; text-align: center;">
          <Text style="color: #ccc; font-size: 12px; line-height: 1.5; margin: 0; white-space: pre-line;">
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
  Row, 
  Column, 
  Heading, 
  Text, 
  Button 
} from '@vue-email/components';

export default {
  name: 'PromoEmailTemplate',
  components: {
    Html, Head, Preview, Body, Container, Section, Row, Column, Heading, Text, Button
  },
  props: {
    previewText: { type: String, default: '' },
    heroTitle: { type: String, default: 'Promocja specjalna!' },
    heroSubtitle: { type: String, default: 'Nie przegap tej okazji' },
    contentText: { type: String, default: '' },
    buttonText: { type: String, default: 'Sprawdź ofertę' },
    buttonUrl: { type: String, default: '#' },
    footerText: { type: String, default: '' }
  }
};
</script>