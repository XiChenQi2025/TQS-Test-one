import { config } from '../../../config/config.js';

/**
 * API客户端类
 * 统一管理API请求
 * 自动携带认证令牌
 * 支持Promise链式调用
 */
class ApiClient {
    constructor() {
        this.baseUrl = config.api.baseUrl;
        this.headers = {
            ...config.api.headers,
            'Authorization': `Bearer ${localStorage.getItem('token')}`
        };
    }

    async get(endpoint, params = {}) {
        const url = new URL(endpoint, this.baseUrl);
        Object.entries(params).forEach(([key, value]) => 
            url.searchParams.append(key, value)
        );

        const response = await fetch(url, {
            method: 'GET',
            headers: this.headers
        });
        return this.#handleResponse(response);
    }

    async post(endpoint, data = {}) {
        const response = await fetch(new URL(endpoint, this.baseUrl), {
            method: 'POST',
            headers: this.headers,
            body: JSON.stringify(data)
        });
        return this.#handleResponse(response);
    }

    async put(endpoint, data = {}) {
        const response = await fetch(new URL(endpoint, this.baseUrl), {
            method: 'PUT',
            headers: this.headers,
            body: JSON.stringify(data)
        });
        return this.#handleResponse(response);
    }

    async delete(endpoint) {
        const response = await fetch(new URL(endpoint, this.baseUrl), {
            method: 'DELETE',
            headers: this.headers
        });
        return this.#handleResponse(response);
    }

    #handleResponse(response) {
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.json();
    }
}

export default ApiClient;
