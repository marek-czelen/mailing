import MarketingCampanies from '../models/marketingCampanies.model.js';
import { Response } from '../include/response.js';
import XLSX from 'xlsx';
import MailAddress from '../models/mailAddress.model.js';
import UPLOAD_DIR from '../config/upload.config.js';
import Path from 'path';
import MarketingCampaniesMailing from '../models/marketingCampaniesMailing.model.js';
import sequelize from '../include/db.js';
import axios from 'axios';
import OPENAI_API_KEY from '../config/openai.config.js';
import OpenAI from "openai";
import fetch from "node-fetch";
// Pobierz wszystkie kampanie
export async function getCampaigns(req, res) {
    try {
        const campaigns = await MarketingCampanies.findAll();
        res.send(new Response(campaigns, true, "Data received successfully."));
    } catch (error) {
        res.send(new Response(null, false, `Failed to fetch campaigns. ${error.message}`, ));
    }
}

// Pobierz jedną kampanię po ID
export async function getCampaignById(req, res) {
    try {
        const campaign = await MarketingCampanies.findByPk(req.params.id);
        if (!campaign) {
            return res.send(new Response(null, false, "Campaign not found."));
        }
        res.send(new Response(campaign, true, "Data received successfully."));
    } catch (error) {
        res.send(new Response(null, false, `Failed to fetch campaign. ${error.message}`));
    }
}

// Utwórz nową kampanię i zaimportuj adresy e-mail z pliku
export async function createCampaign(req, res) {
    try {
        let data = req.body;
        data.active = data.active ? true : false;
        data.progress = data.progress ? data.progress : 0;
        data.customerId = data.customerId ? data.customerId : 1;

        // Utwórz kampanię
        const newCampaign = await MarketingCampanies.create(data);

        // Obsługa pliku z adresami e-mail (zakładamy, że plik jest w req.file)
        let importedAddresses = [];
        if (data.file) {
            const workbook = XLSX.readFile(Path.join(UPLOAD_DIR,data.file));
            const sheetName = workbook.SheetNames[0];
            const sheet = workbook.Sheets[sheetName];
            const rows = XLSX.utils.sheet_to_json(sheet);

            const t = await sequelize.transaction();
            let errorList = [];
            for (const row of rows) {
                try{
                    if (row.email) {
                        // Dodaj adres e-mail do bazy
                        const newMailRecord = await MailAddress.create({ mailAddress: row.email, customerId: 1 }, { transaction: t });

                        const record = await MarketingCampaniesMailing.create({
                            marketingCampaniesId: newCampaign.id,
                            mailAddressesId: newMailRecord.id,}, 
                            { transaction: t });

                        importedAddresses.push(record);
                    }
                }catch(err){
                    await t.rollback();
                    errorList.push(`Failed to import email ${row.email}: ${err.message}`);
                }

            }
            await t.commit();
        }

        res.send(new Response(
            { campaign: newCampaign, importedAddresses },
            true,
            "Campaign created and mail addresses imported successfully."
        ));
    } catch (error) {
        res.send(new Response(null, false, `Failed to create campaign. ${error.message}`));
    }
}

// Aktualizuj kampanię po ID
export async function updateCampaign(req, res) {
    try {
        const [updated] = await MarketingCampanies.update(req.body, {
            where: { id: req.params.id }
        });
        if (!updated) {
            return res.send(new Response(null, false, "Campaign not found."));
        }
        const updatedCampaign = await MarketingCampanies.findByPk(req.params.id);
        res.send(new Response(updatedCampaign, true, "Campaign updated successfully."));
    } catch (error) {
        res.send(new Response(null, false, `Failed to update campaign. ${error.message}`));
    }
}

// Usuń kampanię po ID
export async function deleteCampaign(req, res) {
    try {
        const deleted = await MarketingCampanies.destroy({
            where: { id: req.params.id }
        });
        if (!deleted) {
            return res.send(new Response(null, false, "Campaign not found."));
        }
        res.send(new Response(null, true, "Campaign deleted successfully."));
    } catch (error) {
        res.send(new Response(null, false, `Failed to delete campaign. ${error.message}`));
    }
}




const HF_API_KEY = "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"; // ustaw swój token Hugging Face


export async function listModels(req, res) {
    try {
        const response = await fetch("https://router.huggingface.co/v1/models", {
            headers: {
                "Authorization": `Bearer ${HF_API_KEY}`,
            },
        });

        if (!response.ok) {
            const text = await response.text();
            return res.send(new Response(null, false, `HTTP ${response.status}: ${text}`));
        }

        const models = await response.json();
        // Zwróć listę modeli w odpowiedzi
        res.send(new Response(models.data, true, "Models fetched successfully."));
    } catch (err) {
        res.send(new Response(null, false, `Failed to fetch models: ${err.message}`));
    }
}


export async function generateMailContent(req, res) {
    console.log("generateMailContent called");

    const prompt = req.body.prompt;
    if (!prompt) {
        return res.send(new Response(null, false, "Brak promptu do wygenerowania treści."));
    }

    try {
        const model = "togethercomputer/GPT-NeoXT-Chat-Base-20B"; // Możesz zmienić na inny model dostępny na HF

        const response = await fetch(`https://api-inference.huggingface.co/models/${model}`, {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${HF_API_KEY}`,
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                inputs: prompt,
                parameters: { max_new_tokens: 300 },
            }),
        });

        if (!response.ok) {
            const text = await response.text();
            throw new Error(`HTTP ${response.status}: ${text}`);
        }

        const resultJson = await response.json();

        // Obsługa formatu zwracanego przez HF
        let generatedText = "";
        if (Array.isArray(resultJson) && resultJson[0]?.generated_text) {
            generatedText = resultJson[0].generated_text;
        } else if (resultJson.generated_text) {
            generatedText = resultJson.generated_text;
        } else {
            generatedText = JSON.stringify(resultJson);
        }

        res.send(new Response(generatedText, true, "OK."));

    } catch (error) {
        res.send(new Response(null, false, `Failed to generate mail content: ${error.message}`));
    }
}