import Mdui from 'mdui';

export default {
	get: (url, json = false) =>
		new Promise((resolve, reject) => {
			Mdui.JQ.ajax({
				method: 'GET',
				url,
				success: data => {
					if (json) {
						try {
							resolve(JSON.parse(data));
						} catch (error) {
							reject(error);
						}
					} else resolve(data);
				},
				error: err => reject(err)
			});
		})
};
