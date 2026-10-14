import type { APIRoute } from 'astro';
import { handleLeadRequest } from '../../lib/lead-handler';

export const prerender = false;

export const POST: APIRoute = ({ request }) => handleLeadRequest(request);
