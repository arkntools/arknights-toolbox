import Mdui from 'mdui';

export default {
	get: url =>
		new Promise((resolve, reject) => {
			Mdui.JQ.ajax({
				method: 'GET',
				url,
				success: data => {
					if (url.endsWith('.json')) resolve(JSON.parse(data));
					else resolve(data);
				},
				error: err => reject(err)
			});
		})
};
